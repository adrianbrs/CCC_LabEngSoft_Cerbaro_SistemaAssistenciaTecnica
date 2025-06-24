import { CORS_ORIGIN } from '@/constants/env';
import { ChatEvents } from '@musat/core';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { forwardRef, Inject, UsePipes, ValidationPipe } from '@nestjs/common';
import { ChatMessageServerEventDto } from './dtos/chat-message-server-event.dto';
import { ApiSocket, ApiSocketServer } from '@/shared/websocket';
import { ChatService } from './chat.service';
import { ChatMessageReadEventDto } from './dtos/chat-message-read-event.dto';
import { ChatJoinServerEventDto } from './dtos/chat-join-server-event.dto';

@UsePipes(
  new ValidationPipe({ exceptionFactory: (errors) => new WsException(errors) }),
)
@WebSocketGateway({
  cors: {
    origin: CORS_ORIGIN,
    credentials: true,
  },
})
export class ChatGateway {
  @WebSocketServer()
  readonly server: ApiSocketServer;

  constructor(
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
  ) {}

  @SubscribeMessage(ChatEvents.JOIN_SERVER)
  async handleJoin(
    @MessageBody() data: ChatJoinServerEventDto,
    @ConnectedSocket() client: ApiSocket,
  ) {
    return this.chatService.join(client, data);
  }

  @SubscribeMessage(ChatEvents.LEAVE_SERVER)
  async handleLeave(@ConnectedSocket() client: ApiSocket) {
    return this.chatService.leave(client);
  }

  @SubscribeMessage(ChatEvents.MESSAGE_SERVER)
  async handleSendMessage(
    @MessageBody() data: ChatMessageServerEventDto,
    @ConnectedSocket() client: ApiSocket,
  ) {
    return this.chatService.sendMessage(client, data);
  }

  @SubscribeMessage(ChatEvents.MESSAGE_READ)
  async handleReadMessages(
    @MessageBody() data: ChatMessageReadEventDto,
    @ConnectedSocket() client: ApiSocket,
  ) {
    return this.chatService.readMessages(client, data);
  }
}
