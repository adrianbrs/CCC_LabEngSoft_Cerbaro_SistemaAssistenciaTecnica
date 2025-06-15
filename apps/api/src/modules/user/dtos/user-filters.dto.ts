import { PaginatedQueryDto } from '@/shared/pagination';
import { UserRole } from '@musat/core';
import { IsEnum, IsOptional, MaxLength } from 'class-validator';

export class UserFiltersDto extends PaginatedQueryDto {
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
