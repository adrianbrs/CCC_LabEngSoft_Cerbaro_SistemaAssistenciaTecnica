import { PublicEntityResponseDto } from '@/shared/public-entity-response.dto';
import { IProductPublicResponse } from '@musat/core';
import { Expose, Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { BrandPublicResponseDto } from './brand-public-response.dto';
import { Category } from '../models/category.entity';

export class ProductPublicResponseDto
  extends PublicEntityResponseDto
  implements IProductPublicResponse
{
  @Expose()
  @IsNotEmpty()
  model: string;

  @Expose()
  @ValidateNested()
  @Type(() => BrandPublicResponseDto)
  brand: BrandPublicResponseDto;

  @Expose()
  @ValidateNested()
  @Type(() => Category)
  category: Category;
}
