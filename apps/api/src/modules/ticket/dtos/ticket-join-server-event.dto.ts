import { SocketPayloadDto } from '@/shared/websocket';
import { ITicketJoinServerEvent } from '@musat/core';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class TicketJoinServerEventDto
  extends SocketPayloadDto
  implements ITicketJoinServerEvent
{
  @Expose()
  @IsUUID('4')
  @IsNotEmpty()
  ticketId: string;
}
