import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { LoggedUser } from '../auth/auth.decorator';
import { User } from '../user/models/user.entity';
import { TicketCreateDto } from './dtos/ticket-create.dto';
import { TicketService } from './ticket.service';
import { TicketUpdateDto } from './dtos/ticket-update.dto';
import { Ticket } from './models/ticket.entity';

@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) { }

  @Get()
  async getAll() {
    return this.ticketService.getAll();
  }

  /*
  @Get()
  async getMyTicketsClient(){

  }

  @Get()
  async getMyTicketsTechnician(){

  }*/

  @Post()
  async create(@LoggedUser() client: User, @Body() createDto: TicketCreateDto) {
    return this.ticketService.create(client, createDto);
  }

  @Patch()
  async update(
    technician: User,
    ticketId: Ticket['id'],
    updates: TicketUpdateDto,
  ) {
    return this.ticketService.update(technician, ticketId, updates);
  }

  @Delete('/id')
  async delete(@Param('id') id: string) {
    return this.ticketService.delete(id);
  }
}
