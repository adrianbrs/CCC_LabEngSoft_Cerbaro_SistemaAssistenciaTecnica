import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { TicketModule } from '../ticket/ticket.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './models/message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message]), TicketModule],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
