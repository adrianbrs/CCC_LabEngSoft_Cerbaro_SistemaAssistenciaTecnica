import { Logger, UnauthorizedException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Ticket } from './models/ticket.entity';
import { TechnicianAssignmentService } from './technicianAssignment.service';
import { TicketCreateDto } from './dtos/ticket-create.dto';
import { User } from '../user/models/user.entity';
import { Product } from '../product/models/product.entity';
import { TicketUpdateDto } from './dtos/ticket-update.dto';
import { TicketDto } from './dtos/ticket.dto';
import { isAuthorized, UserRole } from '@musat/core';

export class TicketService {
  private readonly logger = new Logger(TicketService.name);

  constructor(
    private readonly ds: DataSource,
    private readonly technicianAssignmentService: TechnicianAssignmentService,
  ) {}

  /**
   * Function to create a ticket, assign a technician to it automatically
   */
  async create(client: User, ticketDto: TicketCreateDto): Promise<Ticket> {
    this.logger.log(`${client.id} is creating a ticket`);

    const { productId, serialNumber, description } = ticketDto;

    const product = await Product.findOneOrFail({ where: { id: productId } });

    const technician =
      await this.technicianAssignmentService.assignTechnician();

    if (!technician) {
      throw new Error('No technician available');
    }

    const ticket = Ticket.create({
      client,
      technician,
      description,
      product,
      serialNumber,
    });

    this.logger.log(
      `Ticket ${ticket.id} created by ${client.id} and assigned to ${technician.name}`,
    );

    return ticket.save();
  }

  async update(
    technician: User,
    ticketId: Ticket['id'],
    updates: TicketUpdateDto,
  ): Promise<TicketDto> {
    this.logger.log(`Updating ticket ${ticketId} by ${technician.id}`, updates);

    const ticket = await Ticket.findOneOrFail({
      where: {
        id: ticketId,
      },
    });

    if (
      ticket.technician.id !== technician.id &&
      !isAuthorized(technician, UserRole.ADMIN)
    ) {
      throw new UnauthorizedException();
    }

    Ticket.merge(ticket, { ...updates });

    return ticket.save();
  }
}
