import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { GetUser, Auth } from './decorators';

import { CreateUserDto, LoginUserDto, RefreshTokenDto } from './dto';
import { User } from './entities/user.entity';
import { LoginGoogleDto } from './dto/login-google.dto';
import { LoginAppleDto } from './dto/login-apple.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GetLanguage } from 'src/common/decorators/get-language.decorator';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Req() req: Request, @Body() createUserDto: CreateUserDto) {
    const forwarded = req.headers['x-forwarded-for'];
    const ip =
      typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.ip;

    return this.authService.create(createUserDto, ip);
  }

  @Post('login')
  loginUser(
    @Req() req: Request,
    @Body() loginUserDto: LoginUserDto,
    @GetLanguage() language: string,
  ) {
    const forwarded = req.headers['x-forwarded-for'];
    const ip =
      typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.ip;

    return this.authService.login(loginUserDto, language, ip);
  }

  @Post('refresh')
  refresh(
    @Req() req: Request,
    @Body() dto: RefreshTokenDto,
  ) {
    const forwarded = req.headers['x-forwarded-for'];
    const ip =
      typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.ip;

    return this.authService.refresh(dto.refreshToken, ip);
  }

  @Post('google')
  googleAuth(
    @Req() req: Request,
    @Body() loginGoogleDto: LoginGoogleDto,
    @GetLanguage() language: string,
  ) {
    const forwarded = req.headers['x-forwarded-for'];
    const ip =
      typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.ip;

    return this.authService.googleLogin(loginGoogleDto, language, ip);
  }

  @Post('apple')
  appleAuth(
    @Req() req: Request,
    @Body() loginAppleDto: LoginAppleDto,
    @GetLanguage() language: string,
  ) {
    const forwarded = req.headers['x-forwarded-for'];
    const ip =
      typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.ip;

    return this.authService.appleLogin(loginAppleDto, language, ip);
  }

  @Post('forgot-password')
  forgotPassword(
    @Req() req: Request,
    @Body() dto: ForgotPasswordDto,
    @GetLanguage() language: string,
  ) {
    const forwarded = req.headers['x-forwarded-for'];
    const ip =
      typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.ip;

    return this.authService.forgotPassword(dto.email, ip, language);
  }

  @Post('verify-reset-code')
  verifyResetCode(
    @Req() req: Request,
    @Body() dto: VerifyResetCodeDto,
    @GetLanguage() language: string,
  ) {
    const forwarded = req.headers['x-forwarded-for'];
    const ip =
      typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.ip;

    return this.authService.verifyResetCode(dto.email, dto.code, ip, language);
  }

  @Post('reset-password')
  resetPassword(
    @Req() req: Request,
    @Body() dto: ResetPasswordDto,
    @GetLanguage() language: string,
  ) {
    const forwarded = req.headers['x-forwarded-for'];
    const ip =
      typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.ip;

    return this.authService.resetPassword(
      dto.email,
      dto.code,
      dto.newPassword,
      ip,
      language,
    );
  }
}
