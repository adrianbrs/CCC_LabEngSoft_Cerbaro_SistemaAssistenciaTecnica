import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatMessageServerEventDto } from './dtos/chat-message-server-event.dto';
import { User } from '../user/models/user.entity';
import { DataSource, In, Not } from 'typeorm';
import { Message } from './models/message.entity';
import { TicketService } from '../ticket/ticket.service';
import { ChatEvents } from '@musat/core';
import { ChatMessageClientEventDto } from './dtos/chat-message-client-event.dto';
import { Paginated, PaginatedQueryDto } from '@/shared/pagination';
import { ChatMessageReadEventDto } from './dtos/chat-message-read-event.dto';
import { Ticket } from '../ticket/models/ticket.entity';
import { ApiSocket } from '@/shared/websocket';
import { ChatJoinServerEventDto } from './dtos/chat-join-server-event.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  readonly chatRoomPrefix = 'chat:';

  constructor(
    @Inject(forwardRef(() => ChatGateway))
    private readonly gateway: ChatGateway,
    private readonly ds: DataSource,
    private readonly ticketService: TicketService,
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
    ticketId: string,
    query?: PaginatedQueryDto,
  ): Promise<Paginated<Message>> {
    this.logger.log(`Fetching messages for ticket ${ticketId}`);

    const result = await Message.findPaginated(
      {
        where: {
          ticket: { id: ticketId },
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

    return result;
  }

  async sendMessage(
    from: User,
    messageDto: ChatMessageServerEventDto,
  ): Promise<void> {
    this.logger.log(
      `Sending message from user ${from.id} to ticket ${messageDto.ticketId}`,
    );

    await this.ds.transaction(async (manager) => {
      const { ticketId, content } = messageDto;

      const ticket = await this.ticketService.getOne(from, ticketId);

      const message = Message.create({
        from,
        ticket,
        content,
      });

      await manager.save(message);

      this.gateway.server.to(this.getRoom(ticketId)).emit(
        ChatEvents.MESSAGE_CLIENT,
        ChatMessageClientEventDto.create({
          from,
          ticketId,
          content,
        }),
      );
    });
  }

  async readMessages(reader: User, eventDto: ChatMessageReadEventDto) {
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
      return;
    }

    await this.ds.transaction(async (manager) => {
      await manager.update(
        Message,
        {
          id: In(filteredIds),
        },
        {
          read: true,
        },
      );

      this.gateway.server.to(this.getRoom(ticketId)).emit(
        ChatEvents.MESSAGE_READ,
        ChatMessageReadEventDto.create({
          ticketId,
          messageIds: filteredIds,
        }),
      );
    });
  }
}
