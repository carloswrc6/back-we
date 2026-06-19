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
    message: 'The code must be exactly 6 digits',
  })
  @ApiProperty({
    description: '6-digit code sent by email',
    example: '123456',
  })
  code: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @ApiProperty({
    description: 'New password',
    example: 'NewPass123!',
  })
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'The password must have an uppercase letter, a lowercase letter and a number',
  })
  newPassword: string;
}
