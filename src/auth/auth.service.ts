import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { LoginUserDto, CreateUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { handleDBExceptions } from 'src/common/exceptions/db-exception.handler';

import { LoginGoogleDto } from './dto/login-google.dto';
import { LoginAppleDto } from './dto/login-apple.dto';
import { verifyGoogleToken } from './helpers/google.helper';
import { verifyAppleToken } from './helpers/apple.helper';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,
  ) {}

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  async checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
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
        token: this.getJwtToken({ id: user.id }),
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
      select: { email: true, password: true, id: true, provider: true },
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
      token: this.getJwtToken({ id: user.id }),
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
      token: this.getJwtToken({ id: user.id }),
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
      token: this.getJwtToken({ id: user.id }),
    };
  }
}
