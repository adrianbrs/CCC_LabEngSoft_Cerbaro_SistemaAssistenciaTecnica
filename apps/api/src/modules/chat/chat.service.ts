import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatMessageServerEventDto } from './dtos/chat-message-server-event.dto';
import { User } from '../user/models/user.entity';
import { DataSource, In, Not } from 'typeorm';
import { Message } from './models/message.entity';
import { TicketService } from '../ticket/ticket.service';
import { ChatEvents, isAuthorized, UserRole } from '@musat/core';
import { Paginated } from '@/shared/pagination';
import { ChatMessageReadEventDto } from './dtos/chat-message-read-event.dto';
import { Ticket } from '../ticket/models/ticket.entity';
import { ApiSocket } from '@/shared/websocket';
import { ChatJoinServerEventDto } from './dtos/chat-join-server-event.dto';
import { ChatMessageQueryDto } from './dtos/chat-message-query.dto';
import { ChatMessageResponseDto } from './dtos/chat-message-response.dto';
import { ClosedTicketChatError } from './errors/closed-ticket-chat.error';
import { NotificationService } from '../notification/notification.service';
import uri from 'uri-tag';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  readonly chatRoomPrefix = 'chat:';

  constructor(
    @Inject(forwardRef(() => ChatGateway))
    private readonly gateway: ChatGateway,
    private readonly ds: DataSource,
    private readonly ticketService: TicketService,
    private readonly notificationService: NotificationService,
  ) {}

  getRoom(ticketId: Ticket['id']): string {
    return `${this.chatRoomPrefix}:${ticketId}`;
  }

  isRoom(room: string): boolean {
    return room.startsWith(`${this.chatRoomPrefix}:`);
  }

  async join(client: ApiSocket, { ticketId }: ChatJoinServerEventDto) {
    const { user } = client.auth;
    this.logger.log(`User ${user.id} joining chat for ticket ${ticketId}`);

    if (client.rooms.has(this.getRoom(ticketId))) {
      this.logger.warn(
        `User ${user.id} is already in chat room for ticket ${ticketId}`,
      );
      return;
    }

    // Ensure user has access to the ticket
    const ticket = await this.ticketService.getOne(user, ticketId);

    // Ensure the user is in just one chat room at a time
    await this.leave(client);

    // Add the user to the ticket's chat room
    await client.join(this.getRoom(ticket.id));

    this.logger.log(`User ${user.id} joined ticket ${ticketId}`);
  }

  async leave(client: ApiSocket) {
    const { user } = client.auth;
    this.logger.log(`User ${user.id} leaving chat`);

    // Remove the user from all chat rooms they are in
    const rooms = [...client.rooms].filter((room) => this.isRoom(room));
    await Promise.all(rooms.map((room) => client.leave(room)));

    this.logger.log(`User ${user.id} left from ${rooms.length} chat rooms`);
  }

  async getMessages(
    user: User,
    ticketId: string,
    query?: ChatMessageQueryDto,
  ): Promise<Paginated<ChatMessageResponseDto>> {
    this.logger.log(`Fetching messages for ticket ${ticketId}`);

    // Ensure user has access to the ticket
    const ticket = await this.ticketService.getOne(user, ticketId);

    const result = await Message.findPaginated(
      {
        where: {
          ticket: { id: ticket.id },
        },
        order: {
          // Always return the most recent messages first
          // This is important for the chat to display messages in the correct order
          createdAt: 'DESC',
        },
      },
      query,
    );

    this.logger.log(
      `Found ${result.totalItems} messages for ticket ${ticketId}`,
    );

    return result.map((message) =>
      ChatMessageResponseDto.create({
        ...message,
        ticketId: ticket.id,
      }),
    );
  }

  async sendMessage(
    client: ApiSocket,
    messageDto: ChatMessageServerEventDto,
  ): Promise<ChatMessageResponseDto> {
    const { user: from } = client.auth;
    this.logger.log(
      `Sending message from user ${from.id} to ticket ${messageDto.ticketId}`,
    );

    const { ticketId, content } = messageDto;
    const ticket = await this.ticketService.getOne(from, ticketId);

    // Do not allow sending messages to closed tickets unless the user is authorized
    if (ticket.isClosed() && !isAuthorized(from, UserRole.TECHNICIAN)) {
      this.logger.warn(
        `Cannot send messages to closed ticket ${ticketId} by user ${from.id}`,
      );
      throw new ClosedTicketChatError();
    }

    return this.ds.transaction(async (manager) => {
      const message = Message.create({
        from,
        ticket,
        content,
      });

      await manager.save(message);

      const response = ChatMessageResponseDto.create({
        ...message,
        ticketId: ticket.id,
      });

      this.gateway.server
        .to(this.getRoom(ticketId))
        .except(client.id) // Exclude the sender from receiving their own message again
        .emit(ChatEvents.MESSAGE_CLIENT, response);

      const isFromClient = from.id === ticket.client.id;
      const readerUser = isFromClient ? ticket.technician : ticket.client;
      const readerSocket = readerUser.getSocket(this.gateway.server);
      if (readerSocket && !readerSocket.rooms.has(this.getRoom(ticketId))) {
        // Reader is not in the chat room, so we notify them
        await this.notificationService.createOne({
          title: 'Nova mensagem',
          content: `Nova mensagem na solicitação #${ticket.ticketNumber}`,
          userId: readerUser.id,
          metadata: {
            href: isFromClient
              ? uri`/tickets/${ticket.id}`
              : uri`/my-tickets/${ticket.id}`,
          },
        });
      }

      return response;
    });
  }

  async readMessages(
    client: ApiSocket,
    eventDto: ChatMessageReadEventDto,
  ): Promise<ChatMessageReadEventDto> {
    const { user: reader } = client.auth;
    this.logger.log(
      `Marking messages as read by ${reader.id} for ticket ${eventDto.ticketId}`,
      {
        messages: eventDto.messageIds,
      },
    );

    const { ticketId, messageIds } = eventDto;

    const ticket = await this.ticketService.getOne(reader, ticketId);

    const messages = await Message.find({
      where: {
        id: In(messageIds),
        ticket: { id: ticket.id },
        from: {
          // Ensure that the reader is not the one who sent the message
          id: Not(reader.id),
        },
        read: false, // Only mark unread messages as read
      },
      select: {
        id: true,
        ticket: {
          id: true,
        },
        from: {
          id: true,
        },
        read: true,
      },
    });

    const filteredIds = messages.map((m) => m.id);

    if (!filteredIds.length) {
      this.logger.log(
        `No unread messages found for ticket ${ticketId} to mark as read by ${reader.id}`,
      );
      return ChatMessageReadEventDto.create({
        ticketId,
        messageIds: [],
      });
    }

    return this.ds.transaction(async (manager) => {
      await manager.update(
        Message,
        {
          id: In(filteredIds),
        },
        {
          read: true,
        },
      );

      const response = ChatMessageReadEventDto.create({
        ticketId,
        messageIds: filteredIds,
      });

      this.gateway.server
        .to(this.getRoom(ticketId))
        .except(client.id) // Exclude the reader from receiving their own read event
        .emit(ChatEvents.MESSAGE_READ, response);

      return response;
    });
  }
}
