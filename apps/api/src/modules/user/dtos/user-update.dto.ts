import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { UserRegisterDto } from './user-register.dto';
import {
  IsNotEmpty,
  IsOptional,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { AddressUpdateDto } from '../../address/dtos/address-update.dto';
import { Type } from 'class-transformer';

export class UserUpdateDto extends PartialType(
  OmitType(UserRegisterDto, ['cpf', 'email', 'address'] as const),
) {
  @IsNotEmpty()
  // Only require current password if the user is updating their email or password
  @ValidateIf((dto: UserUpdateDto) => !!dto.password)
  @ApiProperty({ example: 'ABCdef123' })
  currentPassword?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressUpdateDto)
  address?: AddressUpdateDto;
}
