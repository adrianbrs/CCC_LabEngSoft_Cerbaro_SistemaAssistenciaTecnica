import { PaginatedQueryDto } from '@/shared/pagination';
import { IsOptional, IsUUID, MaxLength } from 'class-validator';
import { Category } from '../models/category.entity';

export class BrandFiltersDto extends PaginatedQueryDto {
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsUUID('4')
  categoryId?: Category['id'];
}
