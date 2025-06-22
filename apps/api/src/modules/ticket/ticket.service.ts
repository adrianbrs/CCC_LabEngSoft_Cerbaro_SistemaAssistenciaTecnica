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
import { isAuthorized, UserRole } from '@musat/core';
import { ReviewService } from '../review/review.service';
import { TicketQueryDto } from './dtos/ticket-query.dto';
import { Paginated } from '@/shared/pagination';
import { TicketUserQueryDto } from './dtos/ticket-user-query.dto';
import { FindOptionsWhere, ILike } from 'typeorm';
import { DateRange } from '@/shared/dtos';
import { NoTechniciansAvailableError } from './errors/no-technicians-available.error';

@Injectable()
export class TicketService {
  private readonly logger = new Logger(TicketService.name);

  constructor(
    @Inject(forwardRef(() => ReviewService))
    private readonly reviewService: ReviewService,
  ) {}

  private getWhereOptions(
    filters?: Partial<TicketQueryDto>,
  ): FindOptionsWhere<Ticket> {
    return {
      ...(filters?.serialNumber && {
        serialNumber: ILike(`%${filters.serialNumber}%`),
      }),
      ...(filters?.status && {
        status: filters.status,
      }),
      ...(filters?.productId && {
        product: {
          id: filters.productId,
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

  async getAll(query?: TicketQueryDto): Promise<Paginated<Ticket>> {
    this.logger.log('Fetching all tickets', query);

    const result = await Ticket.findPaginated(
      {
        where: this.getWhereOptions(query),
      },
      query,
    );

    this.logger.log(`Found ${result.totalItems} tickets`, query);

    return result;
  }

  async getOne(user: User, ticketId: Ticket['id']): Promise<Ticket> {
    if (!isAuthorized(user, UserRole.ADMIN)) {
      // If user doesn't have admin access, restrict access to their own/assigned tickets
      return Ticket.findOneOrFail({
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
    }

    return Ticket.findOneOrFail({
      where: {
        id: ticketId,
      },
    });
  }

  /**
   * Function to create a ticket and assign a technician to it automatically
   * based on a round-robin algorithm
   * Notifies the technician via email about the new ticket.
   */
  async create(client: User, ticketDto: TicketCreateDto): Promise<Ticket> {
    this.logger.log(`Creating ticket for user ${client.id}`);

    const { productId, ...ticketData } = ticketDto;

    const product = await Product.findOneOrFail({
      where: { id: productId },
    });

    const technicians = await User.find({
      where: {
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

    await Ticket.save(ticket);

    this.logger.log(
      `Ticket ${ticket.id} created and assigned to technician ${technician.id}`,
    );

    // await this.userService.sendTicketAssignedEmail(technician);

    return ticket;
  }

  /**
   * Function to update a ticket's status attribute.
   * Accessible only to technicians and admins.
   * Only the technician assigned to the ticket can update it.
   */
  async update(
    user: User,
    ticketId: Ticket['id'],
    updates: TicketUpdateDto,
  ): Promise<Ticket> {
    this.logger.log(`Updating ticket ${ticketId} by ${user.id}`, updates);

    const ticket = await Ticket.findOneOrFail({
      where: {
        id: ticketId,
      },
    });

    if (
      ticket.technician.id !== user.id &&
      !isAuthorized(user, UserRole.ADMIN)
    ) {
      throw new UnauthorizedException();
    }

    Ticket.merge(ticket, { ...updates });
    //await this.userService.sendTicketUpdateEmail(ticket.client);

    return ticket.save();
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
