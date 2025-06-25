import { Ticket } from '@/modules/ticket/models/ticket.entity';
import { UserPublicResponseDto } from '@/modules/user/dtos/user-public-response.dto';
import { EntityResponseDto } from '@/shared/entity-response.dto';
import { IMessageResponse } from '@musat/core';
import { Expose, Type } from 'class-transformer';
import { IsUUID, ValidateNested } from 'class-validator';

export class ChatMessageResponseDto
  extends EntityResponseDto
  implements IMessageResponse
{
  @Expose()
  @IsUUID('4')
  ticketId: Ticket['id'];

  @Expose()
  content: string;

  @Expose()
  read: boolean;

  @Expose()
  @ValidateNested()
  @Type(() => UserPublicResponseDto)
  from: UserPublicResponseDto;
}
