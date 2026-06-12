import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @IsString()
  @IsEmail()
  @ApiProperty({
    description: 'User email',
    example: 'email@gmail.com',
  })
  email: string;
}
