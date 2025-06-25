import { ApiSocket, ApiSocketServer } from '@/shared/websocket';
import { NotificationEvents } from '@musat/core';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { NotificationReadEventDto } from './dtos/notification-read-event.dto';
import { NotificationService } from './notification.service';
import { forwardRef, Inject, UsePipes, ValidationPipe } from '@nestjs/common';
import { User } from '../user/models/user.entity';
import { NotificationResponseDto } from './dtos/notification-response.dto';
import { Notification } from './models/notification.entity';
import { NotificationDeleteEventDto } from './dtos/notification-delete-event.dto';
import { CORS_ORIGIN } from '@/constants/env';

@UsePipes(
  new ValidationPipe({ exceptionFactory: (errors) => new WsException(errors) }),
)
@WebSocketGateway({
  cors: {
    origin: CORS_ORIGIN,
    credentials: true,
  },
})
export class NotificationGateway {
  @WebSocketServer()
  readonly server: ApiSocketServer;

  constructor(
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
  ) {}

  @SubscribeMessage(NotificationEvents.READ)
  readNotifications(
    @ConnectedSocket() client: ApiSocket,
    @MessageBody() data: NotificationReadEventDto,
  ) {
    return this.notificationService.read(client.auth.user, data);
  }

  @SubscribeMessage(NotificationEvents.REMOVE)
  deleteNotifications(
    @ConnectedSocket() client: ApiSocket,
    @MessageBody() data: NotificationDeleteEventDto,
  ) {
    return this.notificationService.deleteMany(client.auth.user, data);
  }

  sendNotification(user: User, notification: Notification) {
    this.server
      .to(user.id)
      .emit(
        NotificationEvents.RECEIVE_CLIENT,
        NotificationResponseDto.create(notification),
      );
  }
}
