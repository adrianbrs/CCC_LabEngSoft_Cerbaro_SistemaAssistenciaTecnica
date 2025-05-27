import { Module } from '@nestjs/common';
import { TicketController } from './ticket.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './models/ticket.entity';
import { TicketService } from './ticket.service';
import { TechnicianAssignment } from './models/technicianAssignment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, TechnicianAssignment])],
  controllers: [TicketController],
  providers:[TicketService]
})
export class TicketModule {}
