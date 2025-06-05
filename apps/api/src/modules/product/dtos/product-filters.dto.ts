import { IsOptional, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BrandFiltersDto } from './brand-filters.dto';
import { CategoryFiltersDto } from './category-filters.dto';

export class ProductFiltersDto {
  @IsOptional()
  @MaxLength(100)
  model?: string;
}
