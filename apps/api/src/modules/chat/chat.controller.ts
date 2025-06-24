import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { LoggedUser } from '../auth/auth.decorator';
import { User } from '../user/models/user.entity';
import { ChatMessageQueryDto } from './dtos/chat-message-query.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('/:ticketId/messages')
  getMessagesForTicket(
    @LoggedUser() user: User,
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @Query() query: ChatMessageQueryDto,
  ) {
    return this.chatService.getMessages(user, ticketId, query);
  }
}
