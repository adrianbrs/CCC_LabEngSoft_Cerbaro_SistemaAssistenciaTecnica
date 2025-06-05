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

  /**
   * Returns all tickets 
   */
  @Get()
  async getAll() {
    return this.ticketService.getAll();
  }

  /**
   * Returns all the tickets created by the logged user
   */
  @Get('me/tickets')
  async getMyTickets(@LoggedUser() user: User) {
    return this.ticketService.getMyTickets(user);
  }

  /**
   * Returns all the tickets assigned to the logged technician
   */
  @Get('me/technician/tickets')
  async getMyTicketsTechnician(@LoggedUser() user: User){
    return this.ticketService.getMyTicketsTechnician(user);
  }

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
