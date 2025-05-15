import {
  IsEmail,
  IsNotEmpty,
  IsNumberString,
  Length,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { AddressDto } from '../../address/dtos/address.dto';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsCPF, IsStrongPassword } from '@/shared/dto-validators';
import { IsUnique } from '@/modules/shared/validators';
import { User } from '../models/user.entity';

export class UserRegisterDto {
  @IsCPF()
  @ApiProperty({ example: '05660877079' })
  @IsUnique(User, {
    message: 'CPF_ALREADY_EXISTS',
  })
  cpf: string;

  @Length(3, 100)
  name: string;

  @Length(3, 255)
  @IsEmail()
  @IsUnique(User, {
    message: 'EMAIL_ALREADY_EXISTS',
  })
  email: string;

  @MaxLength(55) // Max bcrypt password length
  @IsStrongPassword()
  @ApiProperty({ example: 'ABCdef123' })
  password: string;

  @Length(10, 11)
  @IsNumberString()
  @ApiProperty({ example: '99999999999' })
  phone: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}
