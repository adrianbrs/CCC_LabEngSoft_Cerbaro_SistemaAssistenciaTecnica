import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Authorize, LoggedUser } from '../auth/auth.decorator';
import { User } from '../user/models/user.entity';
import { TicketCreateDto } from './dtos/ticket-create.dto';
import { TicketService } from './ticket.service';
import { TicketUpdateDto } from './dtos/ticket-update.dto';
import { UserRole } from '@musat/core';
import { TicketQueryDto } from './dtos/ticket-query.dto';
import { ApiNestedQuery } from '@/shared/decorators';
import { TicketUserQueryDto } from './dtos/ticket-user-query.dto';

@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  /**
   * Returns all tickets
   */
  @Get()
  @Authorize(UserRole.TECHNICIAN)
  @ApiNestedQuery(TicketQueryDto)
  async getAll(@LoggedUser() user: User, @Query() query: TicketQueryDto) {
    return this.ticketService.getAll(user, query);
  }

  /**
   * Returns all the tickets created by the logged user
   */
  @Get('user')
  @ApiNestedQuery(TicketUserQueryDto)
  async getFromUser(
    @LoggedUser() user: User,
    @Query() query: TicketUserQueryDto,
  ) {
    return this.ticketService.getFromUser(user, query);
  }

  @Post()
  async create(@LoggedUser() client: User, @Body() createDto: TicketCreateDto) {
    return this.ticketService.create(client, createDto);
  }

  @Get(':id')
  async getOne(
    @LoggedUser() user: User,
    @Param('id', ParseUUIDPipe) ticketId: string,
  ) {
    return this.ticketService.getOne(user, ticketId);
  }

  @Patch(':id')
  @Authorize(UserRole.TECHNICIAN)
  async updateOne(
    @LoggedUser() technician: User,
    @Param('id', ParseUUIDPipe) ticketId: string,
    @Body() updates: TicketUpdateDto,
  ) {
    return this.ticketService.update(technician, ticketId, updates);
  }

  @Delete(':id')
  @Authorize(UserRole.ADMIN)
  async delete(@Param('id', ParseUUIDPipe) ticketId: string) {
    return this.ticketService.delete(ticketId);
  }
}
