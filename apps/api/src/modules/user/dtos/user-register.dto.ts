import {
  IsEmail,
  IsNumberString,
  IsStrongPassword,
  Length,
  ValidateNested,
} from 'class-validator';
import { AddressDto } from '../../address/dtos/address.dto';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UserRegisterDto {
  @Length(11, 11)
  @IsNumberString()
  @ApiProperty({ example: '05660877079' })
  cpf: string;

  @Length(3, 100)
  name: string;

  @Length(3, 255)
  @IsEmail()
  email: string;

  @Length(8, 55)
  @IsStrongPassword({
    minLength: 8,
    minSymbols: 0,
  })
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
