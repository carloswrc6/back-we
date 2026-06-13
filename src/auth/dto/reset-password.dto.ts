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
    description: 'Email del usuario',
    example: 'email@gmail.com',
  })
  email: string;

  @IsString()
  @Matches(/^\d{6}$/, {
    message: 'El código debe tener exactamente 6 dígitos',
  })
  @ApiProperty({
    description: 'Código de 6 dígitos enviado por correo',
    example: '123456',
  })
  code: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @ApiProperty({
    description: 'Nueva contraseña',
    example: 'NuevaPass123!',
  })
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'La contraseña debe tener mayúscula, minúscula y un número',
  })
  newPassword: string;
}
