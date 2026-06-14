import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { GetUser, Auth } from './decorators';

import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { LoginGoogleDto } from './dto/login-google.dto';
import { LoginAppleDto } from './dto/login-apple.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GetLanguage } from 'src/common/decorators/get-language.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto,
    @GetLanguage() language: string,
) {
    console.log('language xxx',language);
    return this.authService.login(loginUserDto, language);
  }

  @Post('google')
  googleAuth(@Body() loginGoogleDto: LoginGoogleDto) {
    return this.authService.googleLogin(loginGoogleDto);
  }

  @Post('apple')
  appleAuth(@Body() loginAppleDto: LoginAppleDto) {
    return this.authService.appleLogin(loginAppleDto);
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }

  @Post('forgot-password')
  forgotPassword(@Req() req: Request, @Body() dto: ForgotPasswordDto) {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = typeof forwarded === 'string'
      ? forwarded.split(',')[0].trim()
      : req.ip;

    return this.authService.forgotPassword(dto.email, ip);
  }

  @Post('reset-password')
  resetPassword(@Req() req: Request, @Body() dto: ResetPasswordDto) {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = typeof forwarded === 'string'
      ? forwarded.split(',')[0].trim()
      : req.ip;

    return this.authService.resetPassword(
      dto.email,
      dto.code,
      dto.newPassword,
      ip,
    );
  }
}
