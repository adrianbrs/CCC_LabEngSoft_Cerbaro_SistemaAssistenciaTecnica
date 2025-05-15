import { PartialType } from '@nestjs/swagger';
import { AddressDto } from './address.dto';

export class AddressUpdateDto extends PartialType(AddressDto) {}
