import { forwardRef, Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Ticket } from './models/ticket.entity';
import { TicketCreateDto } from './dtos/ticket-create.dto';
import { User } from '../user/models/user.entity';
import { Product } from '../product/models/product.entity';
import { TicketUpdateDto } from './dtos/ticket-update.dto';
import { TicketDto } from './dtos/ticket.dto';
import { isAuthorized, UserRole } from '@musat/core';
import { ReviewService } from '../review/review.service';
import { UserService } from '../user/user.service';
import { Messages } from '@/constants/messages';

@Injectable()
export class TicketService {
  private readonly logger = new Logger(TicketService.name);

  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => ReviewService))
    private readonly reviewService: ReviewService
  ) { }

  async getAll() {
    return Ticket.find();
  }

  async getOne(ticketId: Ticket['id']) {
    return Ticket.findOneOrFail({
      where: {
        id: ticketId
      }
    });
  }

  /**
 * Function to create a ticket and assign a technician to it automatically
 * based on a round-robin algorithm
 * Notifies the technician via email about the new ticket.
 */
  async create(client: User, ticketDto: TicketCreateDto): Promise<Ticket> {
    this.logger.log('Creating ticket');

    const { productId, ...ticketData } = ticketDto;

    const product = await Product.findOneOrFail({
      where: { id: productId },
    });

    this.logger.log(product)


    const technicians = await User.find({
      where: {
        role: UserRole.TECHNICIAN,
      }
    });
    this.logger.log(technicians);


    if (technicians.length === 0) {
      throw new Error('No technician available');
    }

    const [lastTicket] = await Ticket.find({
      order: { createdAt: 'DESC' },
      relations: ['technician'],
      take: 1,
    });



    this.logger.log(lastTicket)

    let technician: User;

    if (!lastTicket || !lastTicket.technician) {
      technician = technicians[0];
    } else {
      const lastTechnicianIndex = technicians.findIndex(
        (tech) => tech.id === lastTicket.technician.id,
      );

      const nextTechnicianIndex =
        (lastTechnicianIndex + 1) % technicians.length;

      technician = technicians[nextTechnicianIndex];
    }

    this.logger.log(technician);

    const ticket = Ticket.create({
      ...ticketData,
      client,
      product,
      technician,
    });

    this.logger.log(ticket);

    await Ticket.save(ticket);

    this.logger.log(
      `Ticket ${ticket.id} created and assigned to technician ${technician.name}`,
    );

    this.userService.sendTemplateEmail(technician, 'ticket_assigned', {
      subject: Messages.user.email.newTicketAssignSubject,
      data: {
        name: technician.name,
      },
    });

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
  ): Promise<TicketDto> {
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
    this.userService.sendTemplateEmail(user, 'ticket_updated', {
      subject: Messages.user.email.ticketUpdatedSubject,
      data: {
        name: user.name,
      },
    });

    return ticket.save();
  }

  async delete(ticketId: Ticket['id']): Promise<void> {
    this.logger.log(`Deleting ticket with ID: ${ticketId}`);

    const review = await this.reviewService.getByTicket(ticketId);

    if (review) {
      await this.reviewService.delete(review.id);
    }

    const ticket = await Ticket.findOneOrFail({
      where: {
        id: ticketId
      }
    });
    await ticket.remove();
    this.logger.log(`Ticket with ID: ${ticketId} deleted`);

  }

  async getMyTickets(user: User): Promise<Ticket[]> {
    const tickets = await Ticket.find({
      where: {
        client: {
          id: user.id
        }
      }
    });

    return tickets;
  }

  async getMyTicketsTechnician(user: User): Promise<Ticket[]> {
    const tickets = await Ticket.find({
      where: {
        technician: {
          id: user.id
        }
      },
    });

    return tickets;
  }
}
