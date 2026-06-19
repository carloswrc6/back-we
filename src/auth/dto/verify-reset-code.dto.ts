import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches } from 'class-validator';

export class VerifyResetCodeDto {
  @IsString()
  @IsEmail()
  @ApiProperty({
    description: 'User email',
    example: 'email@gmail.com',
  })
  email: string;

  @IsString()
  @Matches(/^\d{6}$/, {
    message: 'The code must be exactly 6 digits',
  })
  @ApiProperty({
    description: '6-digit code sent by email',
    example: '123456',
  })
  code: string;
}
