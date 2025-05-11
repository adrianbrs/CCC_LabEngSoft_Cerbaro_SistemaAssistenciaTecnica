import {
  IsEmail,
  IsNumberString,
  Length,
  ValidateNested,
} from 'class-validator';
import { AddressDto } from './address.dto';
import { Type } from 'class-transformer';

export class UserRegisterDto {
  @Length(11, 11)
  @IsNumberString()
  cpf: string;

  @Length(3, 100)
  name: string;

  @Length(3, 255)
  @IsEmail()
  email: string;

  @Length(8, 55)
  password: string;

  @Length(10, 11)
  @IsNumberString()
  phone: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}
