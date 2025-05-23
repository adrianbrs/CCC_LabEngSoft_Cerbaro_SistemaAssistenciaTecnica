import { PartialType } from "@nestjs/swagger";
import { TicketDto } from "./ticket.dto";

export class TicketUpdateDto extends PartialType(TicketDto){}