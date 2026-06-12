import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsEmail()
  @ApiProperty({
    description: 'User email',
    example: 'email@gmail.com',
  })
  email: string;

  @IsString()
  @Matches(/^\d{6}$/, {
    message: 'The verification code must contain exactly 6 digits',
  })
  @ApiProperty({
    description: 'Code OPT',
    example: '123456',
  })
  code: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @ApiProperty({
    description: 'User password',
    example: '********',
  })
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'The password must have a Uppercase, lowercase letter and a number',
  })
  password: string;
}
