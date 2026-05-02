import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsString()
  @IsEmail()
  @ApiProperty({
    description: 'User email',
    example: 'email@gmail.com',
  })
  email: string;

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

  @IsString()
  @MinLength(1)
  @ApiProperty({
    example: 'Jhon Doe',
  })
  fullName: string;
}
