import { TicketStatus } from '@musat/core';
import { IsEnum } from 'class-validator';

export class TicketUpdateDto {
  @IsEnum(TicketStatus)
  status: TicketStatus;
}
