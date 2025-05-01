import { Module } from '@nestjs/common';
import { TicketController } from './ticket.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './models/ticket.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket])],
  controllers: [TicketController],
})
export class TicketModule {}
