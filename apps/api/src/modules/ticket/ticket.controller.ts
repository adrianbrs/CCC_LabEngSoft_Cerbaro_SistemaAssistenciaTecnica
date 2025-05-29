import { Body, Controller, Post } from '@nestjs/common';
import { LoggedUser } from '../auth/auth.decorator';
import { User } from '../user/models/user.entity';
import { TicketCreateDto } from './dtos/ticket-create.dto';
import { TicketService } from './ticket.service';

@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  async create(@LoggedUser() client: User, @Body() createDto: TicketCreateDto) {
    return this.ticketService.create(client, createDto);
  }
}
