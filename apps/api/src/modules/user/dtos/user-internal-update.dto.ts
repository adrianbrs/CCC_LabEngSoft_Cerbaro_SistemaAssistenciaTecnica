import { IsEnum } from 'class-validator';
import { UserRole } from '@musat/core';

export class UserInternalUpdateDto {
  @IsEnum(UserRole)
  role: UserRole;
}
