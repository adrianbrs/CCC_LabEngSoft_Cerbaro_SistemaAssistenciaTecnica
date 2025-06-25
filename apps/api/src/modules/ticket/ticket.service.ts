import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Ticket } from './models/ticket.entity';
import { TicketCreateDto } from './dtos/ticket-create.dto';
import { User } from '../user/models/user.entity';
import { Product } from '../product/models/product.entity';
import { TicketUpdateDto } from './dtos/ticket-update.dto';
import {
  isAuthorized,
  isTicketClosed,
  TicketEvents,
  TicketStatus,
  UserRole,
} from '@musat/core';
import { ReviewService } from '../review/review.service';
import { TicketQueryDto } from './dtos/ticket-query.dto';
import { Paginated } from '@/shared/pagination';
import { TicketUserQueryDto } from './dtos/ticket-user-query.dto';
import { DataSource, FindOptionsWhere, ILike, Not } from 'typeorm';
import { DateRange } from '@/shared/dtos';
import { NoTechniciansAvailableError } from './errors/no-technicians-available.error';
import { NotificationService } from '../notification/notification.service';
import { UserService } from '../user/user.service';
import uri from 'uri-tag';
import { TicketResponseDto } from './dtos/ticket-response.dto';
import { TicketGateway } from './ticket.gateway';
import { ApiSocket } from '@/shared/websocket';
import { TicketJoinServerEventDto } from './dtos/ticket-join-server-event.dto';

const TICKET_ROOM_PREFIX = 'ticket:';

@Injectable()
export class TicketService {
  private readonly logger = new Logger(TicketService.name);

  constructor(
    @Inject(forwardRef(() => ReviewService))
    private readonly reviewService: ReviewService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
    private readonly ds: DataSource,
    @Inject(forwardRef(() => TicketGateway))
    private readonly gateway: TicketGateway,
  ) {}

  getRoom(ticketId: Ticket['id']): string {
    return `${TICKET_ROOM_PREFIX}:${ticketId}`;
  }

  isRoom(room: string): boolean {
    return room.startsWith(`${TICKET_ROOM_PREFIX}:`);
  }

  async join(client: ApiSocket, { ticketId }: TicketJoinServerEventDto) {
    const { user } = client.auth;
    this.logger.log(`User ${user.id} joining ticket ${ticketId} room`);

    if (client.rooms.has(this.getRoom(ticketId))) {
      this.logger.warn(
        `User ${user.id} is already in the room for ticket ${ticketId}`,
      );
      return;
    }

    // Ensure user has access to the ticket
    const ticket = await this.getOne(user, ticketId);

    // Ensure the user is in just one chat room at a time
    await this.leave(client);

    // Add the user to the ticket's chat room
    await client.join(this.getRoom(ticket.id));

    this.logger.log(`User ${user.id} joined ticket ${ticketId}`);
  }

  async leave(client: ApiSocket) {
    const { user } = client.auth;
    this.logger.log(`User ${user.id} leaving ticket rooms`);

    // Remove the user from all chat rooms they are in
    const rooms = [...client.rooms].filter((room) => this.isRoom(room));
    await Promise.all(rooms.map((room) => client.leave(room)));

    this.logger.log(`User ${user.id} left from ${rooms.length} ticket rooms`);
  }

  private getWhereOptions(
    filters?: Partial<TicketQueryDto>,
  ): FindOptionsWhere<Ticket> {
    const productWhere: FindOptionsWhere<Product> = {
      ...(filters?.productId
        ? {
            id: filters.productId,
          }
        : {
            ...(filters?.categoryId && {
              category: {
                id: filters.categoryId,
              },
            }),
            ...(filters?.brandId && {
              brand: {
                id: filters.brandId,
              },
            }),
          }),
    };

    return {
      product: productWhere,
      ...(filters?.serialNumber && {
        serialNumber: ILike(`%${filters.serialNumber}%`),
      }),
      ...(filters?.status && {
        status: filters.status,
      }),
      ...(filters?.clientId && {
        client: {
          id: filters.clientId,
        },
      }),
      ...(filters?.technicianId && {
        technician: {
          id: filters.technicianId,
        },
      }),
      ...(filters?.closedAt && {
        closedAt: DateRange(filters.closedAt),
      }),
      ...(filters?.createdAt && {
        createdAt: DateRange(filters.createdAt),
      }),
      ...(filters?.updatedAt && {
        updatedAt: DateRange(filters.updatedAt),
      }),
    };
  }

  async getAll(
    user: User,
    query?: TicketQueryDto,
  ): Promise<Paginated<TicketResponseDto>> {
    this.logger.log(`Fetching all tickets for user ${user.id}`, query);

    const result = await Ticket.findPaginated(
      {
        where: {
          ...this.getWhereOptions(query),
          // If user is not an admin, restrict access to their own assigned tickets
          ...(!isAuthorized(user, UserRole.ADMIN) && {
            technician: {
              id: user.id,
            },
          }),
        },
        order: {
          createdAt: 'DESC',
        },
      },
      query,
    );

    this.logger.log(`Found ${result.totalItems} tickets`, query);

    return result.map((ticket) => TicketResponseDto.create(ticket));
  }

  /**
   * Get a single ticket by ID if the user has access to it.
   */
  async getOne(user: User, ticketId: Ticket['id']): Promise<TicketResponseDto> {
    if (!isAuthorized(user, UserRole.ADMIN)) {
      // If user doesn't have admin access, restrict access to their own/assigned tickets
      const ticket = await Ticket.findOneOrFail({
        where: [
          {
            id: ticketId,
            client: {
              id: user.id,
            },
          },
          {
            id: ticketId,
            technician: {
              id: user.id,
            },
          },
        ],
      });

      return TicketResponseDto.create(ticket);
    }

    const ticket = await Ticket.findOneOrFail({
      where: {
        id: ticketId,
      },
    });

    return TicketResponseDto.create(ticket);
  }

  /**
   * Function to create a ticket and assign a technician to it automatically
   * based on a round-robin algorithm
   * Notifies the technician via email about the new ticket.
   */
  async create(
    client: User,
    ticketDto: TicketCreateDto,
  ): Promise<TicketResponseDto> {
    this.logger.log(`Creating ticket for user ${client.id}`);

    const { productId, ...ticketData } = ticketDto;

    const product = await Product.findOneOrFail({
      where: { id: productId },
    });

    const technicians = await User.find({
      where: {
        // Avoid assigning the ticket to the client when they are also a technician
        id: Not(client.id),
        role: UserRole.TECHNICIAN,
      },
      order: {
        // Ensure consistent ordering of technicians.
        // This is important for the round-robin assignment to work correctly.
        // It's possible to add more fields to the order if needed, but
        // it should be deterministic and with infrequent changes to ensure
        // that the round-robin assignment remains consistent.
        createdAt: 'ASC',
        // Ensure consistent ordering using a unique field as a secondary sort key
        id: 'ASC',
      },
    });

    if (!technicians.length) {
      throw new NoTechniciansAvailableError();
    }

    const lastTicket = await Ticket.findOne({
      where: {},
      order: {
        // Get the last ticket based on auto-incremented ticket number
        ticketNumber: 'DESC',
      },
    });

    let technician: User;

    if (!lastTicket) {
      technician = technicians[0];
    } else {
      const lastTechnicianIndex = technicians.findIndex(
        (tech) => tech.id === lastTicket.technician.id,
      );

      const nextTechnicianIndex =
        (lastTechnicianIndex + 1) % technicians.length;

      technician = technicians[nextTechnicianIndex];
    }

    const ticket = Ticket.create({
      ...ticketData,
      client,
      product,
      technician,
    });

    return this.ds.transaction(async (manager) => {
      await manager.save(ticket);

      this.logger.log(
        `Ticket ${ticket.id} created and assigned to technician ${technician.id}`,
      );

      await this.userService.sendTicketAssignedEmail(technician);

      await this.notificationService.createOne({
        title: 'Nova solicitação',
        content: `Você possui uma nova solicitação assignada #${ticket.ticketNumber}.`,
        userId: technician.id,
        metadata: {
          href: uri`/tickets/${ticket.id}`,
        },
      });

      return TicketResponseDto.create(ticket);
    });
  }

  /**
   * Function to update a ticket's status attribute.
   * Accessible only to technicians and admins.
   * Only the technician assigned to the ticket can update it.
   *
   * If the `isInternal` flag is set to `true`, authorization checks will be skipped.
   */
  async update(
    user: User,
    ticketId: Ticket['id'],
    updates: TicketUpdateDto,
    isInternal = false,
  ): Promise<TicketResponseDto> {
    this.logger.log(`Updating ticket ${ticketId} by ${user.id}`, updates);

    const ticket = await Ticket.findOneOrFail({
      where: {
        id: ticketId,
      },
    });

    if (
      ticket.technician.id !== user.id &&
      !isAuthorized(user, UserRole.ADMIN) &&
      !isInternal
    ) {
      throw new UnauthorizedException();
    }

    let closed = false;
    let reopened = false;
    let statusChanged = false;

    if (updates.status && updates.status !== ticket.status) {
      statusChanged = true;

      // If the status is being changed, we need to handle the closedAt field
      if (isTicketClosed(updates)) {
        ticket.closedAt = new Date();
        closed = true;
      } else if (ticket.closedAt) {
        ticket.closedAt = null;
        reopened = true;
      }
    }

    return this.ds.transaction(async (manager) => {
      Ticket.merge(ticket, { ...updates });

      if (closed) {
        if (ticket.status === TicketStatus.RESOLVED) {
          await this.notificationService.createOne({
            title: 'Solicitação finalizada',
            content: `A solicitação #${ticket.ticketNumber} foi finalizada com sucesso.`,
            userId: ticket.client.id,
            metadata: {
              href: uri`/my-tickets/${ticket.id}`,
            },
          });
        } else {
          await this.notificationService.createOne({
            title: 'Solicitação cancelada',
            content: `A solicitação #${ticket.ticketNumber} foi cancelada.`,
            userId: ticket.client.id,
            metadata: {
              href: uri`/my-tickets/${ticket.id}`,
            },
          });
        }
      } else if (reopened) {
        await this.notificationService.createOne({
          title: 'Solicitação reaberta',
          content: `A solicitação #${ticket.ticketNumber} foi reaberta.`,
          userId: ticket.client.id,
          metadata: {
            href: uri`/my-tickets/${ticket.id}`,
          },
        });
      } else if (statusChanged) {
        if (updates.status === TicketStatus.AWAITING_CLIENT) {
          await this.notificationService.createOne({
            title: 'Solicitação aguardando resposta',
            content: `A solicitação #${ticket.ticketNumber} está aguardando sua resposta.`,
            userId: ticket.client.id,
            metadata: {
              href: uri`/my-tickets/${ticket.id}`,
            },
          });
          // Skip notification when the ticket is updated by the client due to some internal logic
        } else if (user.id !== ticket.client.id) {
          await this.notificationService.createOne({
            title: 'Solicitação atualizada',
            content: `A solicitação #${ticket.ticketNumber} foi atualizada.`,
            userId: ticket.client.id,
            metadata: {
              href: uri`/my-tickets/${ticket.id}`,
            },
          });
        }
      }

      // Also notify the technician if the status changed and they are not the one updating it
      if (statusChanged && user.id !== ticket.technician.id) {
        await this.notificationService.createOne({
          title: 'Solicitação atualizada',
          content: `A solicitação #${ticket.ticketNumber} foi atualizada.`,
          userId: ticket.technician.id,
          metadata: {
            href: uri`/tickets/${ticket.id}`,
          },
        });
      }

      await this.userService.sendTicketUpdateEmail(ticket.client);

      const response = TicketResponseDto.create(await manager.save(ticket));

      // Send ticket updates to everyone in the ticket room
      this.gateway.server
        .to(this.getRoom(ticketId))
        .emit(TicketEvents.UPDATE_CLIENT, response);

      return response;
    });
  }

  async delete(ticketId: Ticket['id']): Promise<void> {
    this.logger.log(`Deleting ticket with ID: ${ticketId}`);

    const ticket = await Ticket.findOneOrFail({
      where: {
        id: ticketId,
      },
    });
    await ticket.softRemove();

    this.logger.log(`Ticket with ID: ${ticketId} deleted`);
  }

  async getFromUser(
    user: User,
    filters?: TicketUserQueryDto,
  ): Promise<Paginated<Ticket>> {
    this.logger.log(`Fetching tickets for user ${user.id}`, filters);

    const result = await Ticket.findPaginated(
      {
        where: {
          ...this.getWhereOptions(filters),
          client: {
            id: user.id,
          },
        },
        order: {
          createdAt: 'DESC',
        },
      },
      filters,
    );

    this.logger.log(
      `Found ${result.totalItems} tickets for user ${user.id}`,
      filters,
    );

    return result;
  }
}
