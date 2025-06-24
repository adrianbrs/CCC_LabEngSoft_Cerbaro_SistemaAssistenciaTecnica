import { Ticket } from '@/modules/ticket/models/ticket.entity';
import { UserPublicDataDto } from '@/modules/user/dtos/user-public-data.dto';
import { CoreEntityResponseDto } from '@/shared/core-entity-response.dto';
import { IMessageResponse } from '@musat/core';
import { Expose, Type } from 'class-transformer';
import { IsUUID, ValidateNested } from 'class-validator';

export class ChatMessageResponseDto
  extends CoreEntityResponseDto
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
  @Type(() => UserPublicDataDto)
  from: UserPublicDataDto;
}
