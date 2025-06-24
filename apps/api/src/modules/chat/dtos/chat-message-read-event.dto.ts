import { SocketPayloadDto } from '@/shared/websocket';
import { IChatMessageReadEvent } from '@musat/core';
import { Expose } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class ChatMessageReadEventDto
  extends SocketPayloadDto
  implements IChatMessageReadEvent
{
  @Expose()
  @IsUUID('4')
  @IsNotEmpty()
  ticketId: string;

  @Expose()
  @IsUUID('4', { each: true })
  @IsNotEmpty({ each: true })
  @IsArray()
  @ArrayMaxSize(100) // Reasonable limit to prevent abuse
  messageIds: string[];
}
