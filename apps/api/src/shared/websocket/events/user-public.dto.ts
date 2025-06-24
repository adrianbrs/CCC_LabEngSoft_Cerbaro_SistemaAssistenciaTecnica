import { IUserPublicEvent, UserRole } from '@musat/core';
import { Expose } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

export class UserPublicEventDto implements IUserPublicEvent {
  @IsUUID('4')
  @Expose()
  id: string;

  @IsNotEmpty()
  @Expose()
  name: string;

  @IsEnum(UserRole)
  @Expose()
  role: UserRole;
}
