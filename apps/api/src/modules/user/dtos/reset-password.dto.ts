import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  IsUUID,
} from 'class-validator';
import { User } from '../models/user.entity';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsUUID('4')
  @IsNotEmpty()
  userId: User['id'];

  @IsString()
  @IsStrongPassword()
  @ApiProperty({ example: 'ABCdef123' })
  password: string;
}
