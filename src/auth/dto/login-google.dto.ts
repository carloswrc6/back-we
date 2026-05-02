import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginGoogleDto {

    @IsString()
    @ApiProperty({
        description: 'idToken from Google',
        example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...'
    })
    idToken: string;

}
