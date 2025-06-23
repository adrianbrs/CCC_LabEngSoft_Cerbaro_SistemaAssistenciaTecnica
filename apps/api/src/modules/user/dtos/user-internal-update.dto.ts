import { IsEnum } from 'class-validator';
import { UserRole } from '@musat/core';
import { ApiProperty } from '@nestjs/swagger';

export class UserInternalUpdateDto {
  @IsEnum(UserRole)
  @ApiProperty({
    enum: UserRole,
  })
  role: UserRole;
}
