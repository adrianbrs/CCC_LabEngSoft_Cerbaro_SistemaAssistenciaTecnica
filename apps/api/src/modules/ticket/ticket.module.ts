import { Module, forwardRef } from '@nestjs/common';
import { TicketController } from './ticket.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './models/ticket.entity';
import { TicketService } from './ticket.service';
import { ReviewModule } from '../review/review.module';
import { UserModule } from '../user/user.module';
import { NotificationModule } from '../notification/notification.module';
import { TicketGateway } from './ticket.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket]),
    forwardRef(() => ReviewModule),
    forwardRef(() => UserModule),
    NotificationModule,
  ],
  controllers: [TicketController],
  providers: [TicketService, TicketGateway],
  exports: [TicketService],
})
export class TicketModule {}
