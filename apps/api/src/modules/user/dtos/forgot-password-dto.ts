import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
    @ApiProperty({
        example: 'usuario@example.com',
        description: 'Endereço de e-mail do usuário que deseja redefinir a senha',
    })
    @IsEmail()
    email: string;
}
