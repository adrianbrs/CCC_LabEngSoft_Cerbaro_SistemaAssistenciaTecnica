import { OmitType, PartialType } from '@nestjs/swagger';
import { TicketQueryDto } from './ticket-query.dto';

export class TicketUserQueryDto extends PartialType(
  OmitType(TicketQueryDto, ['technicianId', 'clientId'] as const),
) {}
