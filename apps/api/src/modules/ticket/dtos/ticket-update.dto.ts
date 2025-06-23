import { TicketStatus } from '@musat/core';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class TicketUpdateDto {
  @IsEnum(TicketStatus)
  @ApiProperty({
    enum: TicketStatus,
  })
  status: TicketStatus;
}
