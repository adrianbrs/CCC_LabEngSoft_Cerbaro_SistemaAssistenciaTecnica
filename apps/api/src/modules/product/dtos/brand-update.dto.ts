import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, Length, IsEmail } from 'class-validator';
import { BrandDto } from './brand.dto';


export class BrandUpdateDto extends PartialType(BrandDto) {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  @ApiProperty({ example: 'Brand Name' })
  name?: string;

  @IsOptional()
  @IsEmail()
  @ApiProperty({ example: 'brand@example.com' })
  email?: string;

  @IsOptional()
  @IsString()
  @Length(10, 14)
  @ApiProperty({ example: '11999998888' })
  phone?: string;
}
