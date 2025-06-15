import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { Category } from '../models/category.entity';
import { Brand } from '../models/brand.entity';
import { PaginatedQueryDto } from '@/shared/pagination';

export class ProductFiltersDto extends PaginatedQueryDto {
  @IsOptional()
  @IsUUID('4')
  categoryId?: Category['id'];

  @IsOptional()
  @IsString()
  @IsUUID('4')
  brandId?: Brand['id'];

  @IsOptional()
  @IsString()
  @MaxLength(100)
  model?: string;
}
