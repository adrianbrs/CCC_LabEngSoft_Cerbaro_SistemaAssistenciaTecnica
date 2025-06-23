import { PaginatedQueryDto } from '@/shared/pagination';
import { ICategoryQuery } from '@musat/core';
import { IsOptional, IsUUID, MaxLength } from 'class-validator';

export class CategoryQueryDto
  extends PaginatedQueryDto
  implements ICategoryQuery
{
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsUUID('4')
  brandId?: string | undefined;
}
