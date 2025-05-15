import { IsOptional, Length, MaxLength } from 'class-validator';

export class AddressDto {
  @Length(3, 255)
  street: string;

  @MaxLength(10)
  @IsOptional()
  number: string | null = null;

  @Length(3, 100)
  neighborhood: string;

  @MaxLength(255)
  @IsOptional()
  complement: string | null = null;

  @Length(3, 64)
  city: string;

  @Length(2, 2)
  state: string;

  @Length(8, 8)
  zipCode: string;
}
