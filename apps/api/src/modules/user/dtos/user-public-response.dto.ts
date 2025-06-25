import { PublicEntityResponseDto } from '@/shared/public-entity-response.dto';
import { IUserPublicResponse, UserRole } from '@musat/core';
import { Expose } from 'class-transformer';
import { IsEnum } from 'class-validator';

export class UserPublicResponseDto
  extends PublicEntityResponseDto
  implements IUserPublicResponse
{
  @Expose()
  name: string;

  @Expose()
  @IsEnum(UserRole)
  role: UserRole;
}
