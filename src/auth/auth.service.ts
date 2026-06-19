import { Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash, randomInt, timingSafeEqual } from 'crypto';

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
import { I18nService } from 'src/common/services/i18n.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');
  private static readonly FORGOT_PASSWORD_LIMIT = 5;
  private static readonly FORGOT_PASSWORD_WINDOW_MS = 15 * 60 * 1000;
  private static readonly LOGIN_LIMIT = 10;
  private static readonly LOGIN_WINDOW_MS = 15 * 60 * 1000;
  private static readonly REGISTER_LIMIT = 5;
  private static readonly REGISTER_WINDOW_MS = 15 * 60 * 1000;
  private static readonly SOCIAL_LOGIN_LIMIT = 10;
  private static readonly SOCIAL_LOGIN_WINDOW_MS = 15 * 60 * 1000;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly rateLimiterService: RateLimiterService,
    private readonly i18nService: I18nService,
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

  private checkLoginRateLimit(ip: string) {
    this.rateLimiterService.consume(
      `login-ip:${ip}`,
      AuthService.LOGIN_LIMIT,
      AuthService.LOGIN_WINDOW_MS,
    );
  }

  private checkRegisterRateLimit(ip: string) {
    this.rateLimiterService.consume(
      `register-ip:${ip}`,
      AuthService.REGISTER_LIMIT,
      AuthService.REGISTER_WINDOW_MS,
    );
  }

  private checkSocialLoginRateLimit(ip: string) {
    this.rateLimiterService.consume(
      `social-login-ip:${ip}`,
      AuthService.SOCIAL_LOGIN_LIMIT,
      AuthService.SOCIAL_LOGIN_WINDOW_MS,
    );
  }

  private async registerFailedResetAttempt(user: User) {
    user.resetPasswordAttempts = (user.resetPasswordAttempts || 0) + 1;

    if (user.resetPasswordAttempts >= AuthService.FORGOT_PASSWORD_LIMIT) {
      user.resetPasswordCode = null;
      user.resetPasswordExpires = null;
      user.resetPasswordAttempts = 0;
    }

    await this.userRepository.save(user);
  }

  async create(createUserDto: CreateUserDto, ip: string) {
    try {
      const remoteIp = ip || 'unknown';
      this.checkRegisterRateLimit(remoteIp);

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

  async login(loginUserDto: LoginUserDto, language: string, ip: string) {
    const remoteIp = ip || 'unknown';
    this.checkLoginRateLimit(remoteIp);

    const emailNotRegisteredMessage = this.i18nService.t(
      'auth.email_not_registered',
      language as any,
    );

    const socialLoginRequiredMessage = this.i18nService.t(
      'auth.social_login_required',
      language as any,
    );

    const invalidCredentialsMessage = this.i18nService.t(
      'auth.invalid_credentials',
      language as any,
    );

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
        message: emailNotRegisteredMessage,
      });
    }

    if (user.provider !== 'local') {
      throw new UnauthorizedException({
        field: 'email',
        message: socialLoginRequiredMessage,
      });
    }

    if (!user || !bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException({
        message: invalidCredentialsMessage,
      });
    }

    const { password: _, ...rest } = user;

    return {
      ...rest,
      token: this.getJwtToken({ id: user.id, tokenVersion: user.tokenVersion }),
    };
  }

  async googleLogin(loginGoogleDto: LoginGoogleDto, language: string, ip: string) {
    const remoteIp = ip || 'unknown';
    this.checkSocialLoginRateLimit(remoteIp);

    const { idToken } = loginGoogleDto;
    const invalidGoogleTokenFormatMessage = this.i18nService.t(
      'auth.invalid_google_token_format',
      language as any,
    );

    const invalidGoogleTokenMessage = this.i18nService.t(
      'auth.invalid_google_token',
      language as any,
    );

    const googleAccountNoEmailMessage = this.i18nService.t(
      'auth.google_account_no_email',
      language as any,
    );

    if (!idToken || idToken.split('.').length !== 3) {
      throw new UnauthorizedException(invalidGoogleTokenFormatMessage);
    }

    let payload;
    try {
      payload = await verifyGoogleToken(idToken);
    } catch (error) {
      this.logger.warn(`Google token verification failed: ${error}`);
      throw new UnauthorizedException(invalidGoogleTokenMessage);
    }

    const { email, name } = payload;

    if (!email) {
      throw new UnauthorizedException(googleAccountNoEmailMessage);
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

  async appleLogin(loginAppleDto: LoginAppleDto, language: string, ip: string) {
    const remoteIp = ip || 'unknown';
    this.checkSocialLoginRateLimit(remoteIp);

    const { idToken } = loginAppleDto;
    const invalidAppleTokenFormatMessage = this.i18nService.t(
      'auth.invalid_apple_token_format',
      language as any,
    );

    const invalidAppleTokenMessage = this.i18nService.t(
      'auth.invalid_apple_token',
      language as any,
    );

    const accountRegisteredWithAnotherMethodMessage = this.i18nService.t(
      'auth.account_registered_with_another_method',
      language as any,
    );

    if (!idToken || idToken.split('.').length !== 3) {
      throw new UnauthorizedException(invalidAppleTokenFormatMessage);
    }

    const decoded = await verifyAppleToken(idToken);

    const { email, sub } = decoded;

    if (!sub) {
      throw new UnauthorizedException(invalidAppleTokenMessage);
    }

    const safeEmail = email ?? `${sub}@apple.com`;

    let user = await this.userRepository.findOne({
      where: [{ appleId: sub }, { email: safeEmail }],
    });

    if (user && user.provider !== 'apple') {
      throw new UnauthorizedException(
        accountRegisteredWithAnotherMethodMessage,
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

  async forgotPassword(email: string, ip: string, language: string) {
    const forgotPasswordSentMessage = this.i18nService.t(
      'auth.forgot_password_sent',
      language as any,
    );

    const remoteIp = ip || 'unknown';
    this.checkForgotPasswordRateLimit(remoteIp);
    this.rateLimiterService.consume(
      `forgot-email:${email}`,
      AuthService.FORGOT_PASSWORD_LIMIT,
      AuthService.FORGOT_PASSWORD_WINDOW_MS,
    );

    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        provider: true,
        resetPasswordCode: true,
      },
    });

    if (!user || user.provider !== 'local') {
      return forgotPasswordSentMessage;
    }

    const code = randomInt(100000, 999999).toString();
    const hashedCode = createHash('sha256').update(code).digest('hex');

    user.resetPasswordCode = hashedCode;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    user.resetPasswordAttempts = 0;

    await this.userRepository.save(user);

    try {
      await this.mailService.sendResetPasswordEmail(user.email, code);
    } catch {
      user.resetPasswordCode = null;
      user.resetPasswordExpires = null;
      await this.userRepository.save(user);
      throw new InternalServerErrorException('Failed to send reset email');
    }

    return forgotPasswordSentMessage;
  }

  async verifyResetCode(
    email: string,
    code: string,
    ip: string,
    language: string,
  ) {
    const remoteIp = ip || 'unknown';
    this.checkResetPasswordRateLimit(remoteIp, email);

    const reseCodeInvalidExpiredMessage = this.i18nService.t(
      'auth.reset_code_invalid_or_expired',
      language as any,
    );

    const hashedCode = createHash('sha256').update(code).digest('hex');

    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        id: true,
        resetPasswordCode: true,
        resetPasswordExpires: true,
        resetPasswordAttempts: true,
        email: true,
        provider: true,
      },
    });

    const error = new UnauthorizedException(reseCodeInvalidExpiredMessage);

    if (!user || user.provider !== 'local') {
      throw error;
    }

    if (
      !user.resetPasswordCode ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < new Date()
    ) {
      await this.registerFailedResetAttempt(user);
      throw error;
    }

    const storedHash = Buffer.from(user.resetPasswordCode, 'hex');
    const receivedHash = Buffer.from(hashedCode, 'hex');
    const isValidCode =
      storedHash.length === receivedHash.length &&
      timingSafeEqual(storedHash, receivedHash);

    if (!isValidCode) {
      await this.registerFailedResetAttempt(user);
      throw error;
    }

    return { message: 'Code verified successfully' };
  }

  async resetPassword(
    email: string,
    code: string,
    password: string,
    ip: string,
    language: string,
  ) {
    const reseCodeInvalidExpiredMessage = this.i18nService.t(
      'auth.reset_code_invalid_or_expired',
      language as any,
    );
    const passwordUpdatedSuccessMessage = this.i18nService.t(
      'auth.password_updated_successfully',
      language as any,
    );
    const remoteIp = ip || 'unknown';
    this.checkResetPasswordRateLimit(remoteIp, email);

    const hashedCode = createHash('sha256').update(code).digest('hex');

    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        id: true,
        password: true,
        resetPasswordCode: true,
        resetPasswordExpires: true,
        resetPasswordAttempts: true,
        tokenVersion: true,
        email: true,
        provider: true,
      },
    });

    const error = new UnauthorizedException(reseCodeInvalidExpiredMessage);

    if (!user || user.provider !== 'local') {
      throw error;
    }

    if (
      !user.resetPasswordCode ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < new Date()
    ) {
      await this.registerFailedResetAttempt(user);
      throw error;
    }

    const storedHash = Buffer.from(user.resetPasswordCode, 'hex');
    const receivedHash = Buffer.from(hashedCode, 'hex');
    const isValidCode =
      storedHash.length === receivedHash.length &&
      timingSafeEqual(storedHash, receivedHash);

    if (!isValidCode) {
      await this.registerFailedResetAttempt(user);
      throw error;
    }

    user.password = bcrypt.hashSync(password, 10);
    user.resetPasswordCode = null;
    user.resetPasswordExpires = null;
    user.resetPasswordAttempts = 0;
    user.tokenVersion = (user.tokenVersion || 0) + 1;

    await this.userRepository.save(user);

    return {
      message: passwordUpdatedSuccessMessage,
    };
  }
}
