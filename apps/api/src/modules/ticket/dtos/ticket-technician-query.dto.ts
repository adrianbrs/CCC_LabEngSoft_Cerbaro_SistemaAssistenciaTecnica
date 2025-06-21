import { OmitType, PartialType } from '@nestjs/swagger';
import { TicketQueryDto } from './ticket-query.dto';

export class TicketTechnicianQueryDto extends PartialType(
  OmitType(TicketQueryDto, ['technicianId'] as const),
) {}
