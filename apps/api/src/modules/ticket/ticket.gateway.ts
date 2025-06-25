import { CORS_ORIGIN } from '@/constants/env';
import { forwardRef, Inject, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { ApiSocket, ApiSocketServer } from '@/shared/websocket';
import { TicketService } from './ticket.service';
import { TicketJoinServerEventDto } from './dtos/ticket-join-server-event.dto';
import { TicketEvents } from '@musat/core';

@UsePipes(
  new ValidationPipe({ exceptionFactory: (errors) => new WsException(errors) }),
)
@WebSocketGateway({
  cors: {
    origin: CORS_ORIGIN,
    credentials: true,
  },
})
export class TicketGateway {
  @WebSocketServer()
  readonly server: ApiSocketServer;

  constructor(
    @Inject(forwardRef(() => TicketService))
    private readonly ticketService: TicketService,
  ) {}

  @SubscribeMessage(TicketEvents.JOIN_SERVER)
  async handleJoin(
    @MessageBody() data: TicketJoinServerEventDto,
    @ConnectedSocket() client: ApiSocket,
  ) {
    return this.ticketService.join(client, data);
  }

  @SubscribeMessage(TicketEvents.LEAVE_SERVER)
  async handleLeave(@ConnectedSocket() client: ApiSocket) {
    return this.ticketService.leave(client);
  }
}
