import { PaginatedQueryDto } from '@/shared/pagination';
import { IUserQuery, UserRole } from '@musat/core';
import { IsEnum, IsOptional, MaxLength } from 'class-validator';

export class UserQueryDto extends PaginatedQueryDto implements IUserQuery {
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
