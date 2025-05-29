import { Logger, UnauthorizedException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Ticket } from './models/ticket.entity';
import { TicketCreateDto } from './dtos/ticket-create.dto';
import { User } from '../user/models/user.entity';
import { Product } from '../product/models/product.entity';
import { TicketUpdateDto } from './dtos/ticket-update.dto';
import { TicketDto } from './dtos/ticket.dto';
import { isAuthorized, UserRole } from '@musat/core';
import { UserDto } from '../user/dtos/user.dto';

export class TicketService {
  private readonly logger = new Logger(TicketService.name);

  constructor(
    private readonly ds: DataSource,
  ) { }

  async getAll() {
    return Ticket.find();
  }

  /**
 * Function to create a ticket and assign a technician to it automatically
 */
  async create(client: User, ticketDto: TicketCreateDto): Promise<Ticket> {
    this.logger.log('Creating ticket');

    const { productId, ...ticketData } = ticketDto;

    // Busca produto pelo ID
    const product = await Product.findOneOrFail({
      where: { id: productId },
    });

    this.logger.log(product)

    // Assignment de técnico via Round Robin
    const technicians = await User.find({
      where: {
        role: UserRole.TECHNICIAN, // Filtra apenas usuários com a função de técnico
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

    //Criação do ticket
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

    return ticket;
  }



  /**
   * Function to update a ticket's status attribute.
   * Accessible only to technicians and admins
   */

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

  async delete(ticketId: Ticket['id']): Promise<void> {
    this.logger.log(`Deleting ticket with ID: ${ticketId}`);

    const ticket = await Ticket.findOneOrFail({
      where: {
        id: ticketId
      }
    });
    await ticket.remove();
    this.logger.log(`Ticket with ID: ${ticketId} deleted`);

  }
}
