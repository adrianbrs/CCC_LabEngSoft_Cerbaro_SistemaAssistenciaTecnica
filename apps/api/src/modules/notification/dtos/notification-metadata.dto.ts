import { INotificationMetadata } from '@musat/core';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class NotificationMetadataDto implements INotificationMetadata {
  @Expose()
  @IsString()
  href?: string | undefined;

  @Expose()
  @IsString()
  target?: string | undefined;
}
