import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginAppleDto {

    @IsString()
    @ApiProperty({
        description: 'idToken from Apple',
        example: 'idToken'
    })
    idToken: string;

}