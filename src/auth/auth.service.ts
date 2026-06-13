import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';

import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { LoginUserDto, CreateUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { handleDBExceptions } from 'src/common/exceptions/db-exception.handler';

import { LoginGoogleDto } from './dto/login-google.dto';
import { LoginAppleDto } from './dto/login-apple.dto';
import { verifyGoogleToken } from './helpers/google.helper';
import { verifyAppleToken } from './helpers/apple.helper';
import { MailService } from 'src/mail/mail.service';
import { RateLimiterService } from 'src/common/rate-limiter.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');
  private static readonly FORGOT_PASSWORD_LIMIT = 5;
  private static readonly FORGOT_PASSWORD_WINDOW_MS = 15 * 60 * 1000;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly rateLimiterService: RateLimiterService,
  ) {}

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  private checkForgotPasswordRateLimit(ip: string) {
    this.rateLimiterService.consume(
      `forgot-ip:${ip}`,
      AuthService.FORGOT_PASSWORD_LIMIT,
      AuthService.FORGOT_PASSWORD_WINDOW_MS,
    );
  }

  private checkResetPasswordRateLimit(ip: string, email?: string) {
    this.rateLimiterService.consume(
      `reset-ip:${ip}`,
      AuthService.FORGOT_PASSWORD_LIMIT,
      AuthService.FORGOT_PASSWORD_WINDOW_MS,
    );

    if (email) {
      this.rateLimiterService.consume(
        `reset-email:${email}`,
        AuthService.FORGOT_PASSWORD_LIMIT,
        AuthService.FORGOT_PASSWORD_WINDOW_MS,
      );
    }
  }

  private registerFailedResetAttempt(user: User) {
    user.resetPasswordAttempts = (user.resetPasswordAttempts || 0) + 1;

    if (user.resetPasswordAttempts >= AuthService.FORGOT_PASSWORD_LIMIT) {
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      user.resetPasswordAttempts = 0;
    }

    this.userRepository.save(user);
  }

  async checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id, tokenVersion: user.tokenVersion }),
    };
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      await this.userRepository.save(user);
      delete user.password;

      return {
        ...user,
        token: this.getJwtToken({
          id: user.id,
          tokenVersion: user.tokenVersion,
        }),
      };
      // TODO: Retornar el JWT de acceso
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        fullName: true,
        email: true,
        password: true,
        id: true,
        provider: true,
        tokenVersion: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException({
        field: 'email',
        message: 'El correo no está registrado',
      });
    }

    if (user.provider !== 'local') {
      throw new UnauthorizedException({
        field: 'email',
        message: 'Esta cuenta usa inicio de sesión social',
      });
    }

    if (!user || !bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException({
        message: 'Credenciales incorrectas',
      });
    }

    const { password: _, ...rest } = user;

    return {
      ...rest,
      token: this.getJwtToken({ id: user.id, tokenVersion: user.tokenVersion }),
    };
  }

  async googleLogin(loginGoogleDto: LoginGoogleDto) {
    const { idToken } = loginGoogleDto;

    if (!idToken || idToken.split('.').length !== 3) {
      throw new UnauthorizedException('Invalid Google token format');
    }

    let payload;
    try {
      payload = await verifyGoogleToken(idToken);
    } catch (error) {
      this.logger.warn(`Google token verification failed: ${error}`);
      throw new UnauthorizedException('Invalid Google token');
    }

    const { email, name } = payload;

    if (!email) {
      throw new UnauthorizedException('Google account has no email');
    }

    let user = await this.userRepository.findOneBy({ email });

    if (!user) {
      user = this.userRepository.create({
        email,
        fullName: name,
        password: '@',
        provider: 'google',
      });

      await this.userRepository.save(user);
    }
    const { password: _, ...rest } = user;

    return {
      ...rest,
      token: this.getJwtToken({ id: user.id, tokenVersion: user.tokenVersion }),
    };
  }

  async appleLogin(loginAppleDto: LoginAppleDto) {
    const { idToken } = loginAppleDto;

    if (!idToken || idToken.split('.').length !== 3) {
      throw new UnauthorizedException('Invalid Apple token format');
    }

    const decoded = await verifyAppleToken(idToken);

    const { email, sub } = decoded;

    if (!sub) {
      throw new UnauthorizedException('Invalid Apple token');
    }

    const safeEmail = email ?? `${sub}@apple.com`;

    let user = await this.userRepository.findOne({
      where: [{ appleId: sub }, { email: safeEmail }],
    });

    if (user && user.provider !== 'apple') {
      throw new UnauthorizedException(
        'This account is registered with another method',
      );
    }

    if (!user) {
      user = this.userRepository.create({
        email: safeEmail,
        fullName: safeEmail,
        password: '@',
        appleId: sub,
        provider: 'apple',
      });

      await this.userRepository.save(user);
    }

    const { password: _, ...rest } = user;

    return {
      ...rest,
      token: this.getJwtToken({ id: user.id, tokenVersion: user.tokenVersion }),
    };
  }

  async forgotPassword(email: string, ip: string) {
    const response = {
      message: 'Si el correo está registrado, recibirás instrucciones',
    };

    const remoteIp = ip || 'unknown';
    this.checkForgotPasswordRateLimit(remoteIp);

    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        provider: true,
        resetPasswordToken: true,
      },
    });

    if (!user || user.provider !== 'local') {
      return response;
    }

    const code = Math.floor(100000 + Math.random() * 900000)
      .toString()
      .padStart(6, '0');
    const hashedCode = createHash('sha256').update(code).digest('hex');

    user.resetPasswordToken = hashedCode;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    user.resetPasswordAttempts = 0;

    await this.userRepository.save(user);
    await this.mailService.sendResetPasswordEmail(user.email, code);

    return response;
  }

  async resetPassword(
    email: string,
    code: string,
    password: string,
    ip: string,
  ) {
    const remoteIp = ip || 'unknown';
    this.checkResetPasswordRateLimit(remoteIp, email);

    const hashedCode = createHash('sha256').update(code).digest('hex');

    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        id: true,
        password: true,
        resetPasswordToken: true,
        resetPasswordExpires: true,
        resetPasswordAttempts: true,
        tokenVersion: true,
        email: true,
        provider: true,
      },
    });

    const error = new UnauthorizedException('Código inválido o expirado');

    if (!user || user.provider !== 'local') {
      throw error;
    }

    if (
      !user.resetPasswordToken ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < new Date()
    ) {
      this.registerFailedResetAttempt(user);
      throw error;
    }

    const storedHash = Buffer.from(user.resetPasswordToken, 'hex');
    const receivedHash = Buffer.from(hashedCode, 'hex');
    const isValidCode =
      storedHash.length === receivedHash.length &&
      timingSafeEqual(storedHash, receivedHash);

    if (!isValidCode) {
      this.registerFailedResetAttempt(user);
      throw error;
    }

    user.password = bcrypt.hashSync(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.resetPasswordAttempts = 0;
    user.tokenVersion = (user.tokenVersion || 0) + 1;

    await this.userRepository.save(user);

    return {
      message: 'Contraseña actualizada correctamente',
    };
  }
}
