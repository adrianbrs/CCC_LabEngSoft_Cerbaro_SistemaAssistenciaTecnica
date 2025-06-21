import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Review } from './models/review.entity';
import { ReviewUpdateDto } from './dtos/review-update.dto';
import { User } from '../user/models/user.entity';
import { Ticket } from '../ticket/models/ticket.entity';
import { TicketService } from '../ticket/ticket.service';
import { UserService } from '../user/user.service';
import { ReviewCreateDto } from './dtos/review-create.dto';
import { TicketStatus } from '@musat/core';

@Injectable()
export class ReviewService {
  constructor(
    @Inject(forwardRef(() => TicketService))
    private readonly ticketService: TicketService,
    private readonly userService: UserService,
  ) {}

  async getAll() {
    return Review.find();
  }

  async create(
    ticketId: Ticket['id'],
    user: User,
    reviewDto: ReviewCreateDto,
  ): Promise<Review> {
    const ticket = await Ticket.findOneOrFail({
      where: {
        id: ticketId,
      },
    });

    console.log(
      'TICKET ID: ' +
        ticket.id +
        '\n VAMO TESTAR userID \n ' +
        user.id +
        '\n VAMO TESTAR TICKET.CLIENT \n ' +
        ticket.client.id,
    );

    if (
      ticket.client.id !== user.id ||
      ticket.status !== TicketStatus.RESOLVED
    ) {
      throw new Error('You are not authorized to review this ticket');
    }

    const review = Review.create({
      ...reviewDto,
      ticket: ticket,
      client: user,
    });

    return review.save();
  }

  async getByClient(userId: User['id']) {
    return Review.find({
      where: {
        client: {
          id: userId,
        },
      },
    });
  }

  async getByTechnician(technicianId: User['id']) {
    return Review.find({
      where: {
        ticket: {
          technician: {
            id: technicianId,
          },
        },
      },
    });
  }

  async getByTicket(ticketId: Ticket['id']) {
    return Review.findOne({
      where: {
        ticket: {
          id: ticketId,
        },
      },
    });
  }

  async update(
    reviewId: Review['id'],
    updates: ReviewUpdateDto,
  ): Promise<Review> {
    const review = await Review.findOneOrFail({
      where: {
        id: reviewId,
      },
    });

    Review.merge(review, { ...updates });

    return review.save();
  }

  async delete(reviewId: Review['id']): Promise<void> {
    const review = await Review.findOneOrFail({
      where: {
        id: reviewId,
      },
    });

    await review.remove();
  }
}
