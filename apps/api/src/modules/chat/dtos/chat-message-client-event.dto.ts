import { SocketPayloadDto } from '@/shared/websocket';
import { UserPublicEventDto } from '@/shared/websocket/events';
import type { IChatMessageClientEvent } from '@musat/core';
import { Expose, Type } from 'class-transformer';
import { IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';

export class ChatMessageClientEventDto
  extends SocketPayloadDto
  implements IChatMessageClientEvent
{
  @Expose()
  @IsUUID('4')
  @IsNotEmpty()
  ticketId: string;

  @Expose()
  @IsNotEmpty()
  content: string;

  @Expose()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => UserPublicEventDto)
  from: UserPublicEventDto;
}
