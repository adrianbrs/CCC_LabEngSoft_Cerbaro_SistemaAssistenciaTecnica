import { SocketPayloadDto } from '@/shared/websocket';
import { INotificationReadEvent } from '@musat/core';
import { Expose } from 'class-transformer';
import { IsArray, IsString, IsUUID } from 'class-validator';

export class NotificationReadEventDto
  extends SocketPayloadDto
  implements INotificationReadEvent
{
  @Expose()
  @IsArray()
  @IsString({ each: true })
  @IsUUID('4', { each: true })
  notificationIds: string[];
}
