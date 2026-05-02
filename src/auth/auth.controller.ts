import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { GetUser, Auth } from './decorators';

import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { LoginGoogleDto } from './dto/login-google.dto';
import { LoginAppleDto } from './dto/login-apple.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto ) {
    return this.authService.create( createUserDto );
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto ) {
    return this.authService.login( loginUserDto );
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
  checkAuthStatus(
    @GetUser() user: User
  ) {
    return this.authService.checkAuthStatus( user );
  }


}
