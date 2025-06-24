import { IChatMessageServerEvent } from '@musat/core';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class ChatMessageServerEventDto implements IChatMessageServerEvent {
  @Expose()
  @IsUUID('4')
  @IsNotEmpty()
  ticketId: string;

  @Expose()
  @IsNotEmpty()
  content: string;
}
