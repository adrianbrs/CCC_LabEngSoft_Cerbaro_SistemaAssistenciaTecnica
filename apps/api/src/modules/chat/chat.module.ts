import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { TicketModule } from '../ticket/ticket.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './models/message.entity';
import { ChatController } from './chat.controller';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    TicketModule,
    NotificationModule,
  ],
  providers: [ChatGateway, ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
