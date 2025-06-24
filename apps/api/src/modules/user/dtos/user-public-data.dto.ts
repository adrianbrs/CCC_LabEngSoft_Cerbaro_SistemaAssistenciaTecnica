import { CoreEntityResponseDto } from '@/shared/core-entity-response.dto';
import { IUserPublicData, UserRole } from '@musat/core';
import { Expose } from 'class-transformer';
import { IsEnum } from 'class-validator';

export class UserPublicDataDto
  extends CoreEntityResponseDto
  implements IUserPublicData
{
  @Expose()
  name: string;

  @Expose()
  @IsEnum(UserRole)
  role: UserRole;
}
