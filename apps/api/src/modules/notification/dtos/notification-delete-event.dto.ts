import { SocketPayloadDto } from '@/shared/websocket';
import { INotificationDeleteEvent } from '@musat/core';
import { Expose } from 'class-transformer';
import { IsArray, IsString, IsUUID } from 'class-validator';

export class NotificationDeleteEventDto
  extends SocketPayloadDto
  implements INotificationDeleteEvent
{
  @Expose()
  @IsArray()
  @IsString({ each: true })
  @IsUUID('4', { each: true })
  notificationIds: string[];
}
