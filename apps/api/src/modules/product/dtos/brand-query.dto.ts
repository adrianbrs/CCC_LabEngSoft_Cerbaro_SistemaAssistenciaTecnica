import { PaginatedQueryDto } from '@/shared/pagination';
import { IsOptional, IsUUID, MaxLength } from 'class-validator';
import { Category } from '../models/category.entity';
import { IBrandQuery } from '@musat/core';

export class BrandQueryDto extends PaginatedQueryDto implements IBrandQuery {
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsUUID('4')
  categoryId?: Category['id'];
}
