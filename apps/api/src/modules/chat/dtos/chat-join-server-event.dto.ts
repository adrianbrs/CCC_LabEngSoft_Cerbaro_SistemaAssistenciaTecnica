import { SocketPayloadDto } from '@/shared/websocket';
import { IChatJoinServerEvent } from '@musat/core';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class ChatJoinServerEventDto
  extends SocketPayloadDto
  implements IChatJoinServerEvent
{
  @Expose()
  @IsUUID('4')
  @IsNotEmpty()
  ticketId: string;
}
