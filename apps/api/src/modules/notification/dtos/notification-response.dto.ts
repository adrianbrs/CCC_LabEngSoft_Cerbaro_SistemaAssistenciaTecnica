import { EntityResponseDto } from '@/shared/entity-response.dto';
import { INotificationResponse } from '@musat/core';
import { Expose, Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { NotificationMetadataDto } from './notification-metadata.dto';

export class NotificationResponseDto
  extends EntityResponseDto
  implements INotificationResponse
{
  @Expose()
  @IsNotEmpty()
  content: string;

  @Expose()
  read: boolean;

  @Expose()
  title: string;

  @Expose()
  @Type(() => NotificationMetadataDto)
  @ValidateNested()
  @IsOptional()
  metadata?: NotificationMetadataDto | undefined;
}
