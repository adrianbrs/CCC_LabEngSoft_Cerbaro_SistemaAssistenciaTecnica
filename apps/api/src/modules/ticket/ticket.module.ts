import { Module, forwardRef } from '@nestjs/common';
import { TicketController } from './ticket.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './models/ticket.entity';
import { TicketService } from './ticket.service';
import { ReviewModule } from '../review/review.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket]),
    forwardRef(() => ReviewModule),
    forwardRef(() => UserModule),
  ],
  controllers: [TicketController],
  providers: [TicketService],
  exports: [TicketService], 
})
export class TicketModule {}
