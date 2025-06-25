import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatMessageServerEventDto } from './dtos/chat-message-server-event.dto';
import { User } from '../user/models/user.entity';
import { DataSource, In, Not } from 'typeorm';
import { Message } from './models/message.entity';
import { TicketService } from '../ticket/ticket.service';
import {
  ChatEvents,
  isAuthorized,
  isTicketClosed,
  TicketStatus,
  UserRole,
} from '@musat/core';
import { Paginated } from '@/shared/pagination';
import { ChatMessageReadEventDto } from './dtos/chat-message-read-event.dto';
import { ApiSocket } from '@/shared/websocket';
import { ChatMessageQueryDto } from './dtos/chat-message-query.dto';
import { ChatMessageResponseDto } from './dtos/chat-message-response.dto';
import { ClosedTicketChatError } from './errors/closed-ticket-chat.error';
import { NotificationService } from '../notification/notification.service';
import uri from 'uri-tag';
import { UserService } from '../user/user.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @Inject(forwardRef(() => ChatGateway))
    private readonly gateway: ChatGateway,
    private readonly ds: DataSource,
    @Inject(forwardRef(() => TicketService))
    private readonly ticketService: TicketService,
    private readonly notificationService: NotificationService,
    private readonly userService: UserService,
  ) {}

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

    return this.ds.transaction(async (manager) => {
      const ticket = await this.ticketService.getOne(from, ticketId);

      // Do not allow sending messages to closed tickets unless the user is authorized
      if (isTicketClosed(ticket) && !isAuthorized(from, UserRole.TECHNICIAN)) {
        this.logger.warn(
          `Cannot send messages to closed ticket ${ticketId} by user ${from.id}`,
        );
        throw new ClosedTicketChatError();
      }

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

      // Send the message to the chat room
      this.gateway.server
        .to(this.ticketService.getRoom(ticketId))
        .except(client.id) // Exclude the sender from receiving their own message again
        .emit(ChatEvents.MESSAGE_CLIENT, response);

      // Send message notification to readers outside the chat room
      const isFromClient = from.id === ticket.client.id;
      const readerUser = isFromClient ? ticket.technician : ticket.client;
      const readerSocket = this.gateway.server.getByUser(readerUser);
      if (
        readerSocket &&
        !readerSocket.rooms.has(this.ticketService.getRoom(ticketId))
      ) {
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

      // Update ticket status if is OPEN and the message is from the technician
      if (
        ticket.status === TicketStatus.OPEN &&
        from.id === ticket.technician.id
      ) {
        const technician = await this.userService.getOne(ticket.technician.id);
        await this.ticketService.update(technician, ticket.id, {
          status: TicketStatus.IN_PROGRESS,
        });
        // Update the ticket status if is AWAITING_CLIENT and the message is from the client
      } else if (
        ticket.status === TicketStatus.AWAITING_CLIENT &&
        from.id === ticket.client.id
      ) {
        const client = await this.userService.getOne(ticket.client.id);
        await this.ticketService.update(
          client,
          ticket.id,
          {
            status: TicketStatus.IN_PROGRESS,
          },
          // This is improtant because the client is not allowed to change the ticket status
          true,
        );
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
        .to(this.ticketService.getRoom(ticketId))
        .except(client.id) // Exclude the reader from receiving their own read event
        .emit(ChatEvents.MESSAGE_READ, response);

      return response;
    });
  }
}
