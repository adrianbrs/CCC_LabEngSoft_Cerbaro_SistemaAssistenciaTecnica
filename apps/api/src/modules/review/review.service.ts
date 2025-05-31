import { Injectable } from "@nestjs/common";
import { Review } from "./models/review.entity";
import { ReviewUpdateDto } from "./dtos/review-update.dto";
import { ReviewDto } from "./dtos/review.dto";
import { User } from "../user/models/user.entity";
import { Ticket } from "../ticket/models/ticket.entity";
import { Category } from "../product/models/category.entity";
import { Brand } from "../product/models/brand.entity";
import { Product } from "../product/models/product.entity";
import { TicketService } from "../ticket/ticket.service";

@Injectable()
export class ReviewService {

    constructor(private readonly ticketService: TicketService) { }


    async getAll() {
        return Review.find();
    }

    async getOne(reviewId: Review['id']) {
        return Review.findOneOrFail({
            where: {
                id: reviewId
            }
        })
    }

    async create(ticketId: Ticket['id']){
        const ticket = await this.ticketService.getOne(ticketId);

        if (!ticket) {
            throw new Error('Ticket not found');
        }

        const review = Review.create({
            ticket: ticket,
            client: ticket.client,
            stars: 0, // Default value
            description: ''
        });

        return review.save();
    }

    async getByClient(userId: User['id']) {
        return Review.find({
            where: {
                client: {
                    id: userId
                }
            }
        })
    }

    async getByTechnician(ticketId: Ticket['id']) {

        const ticket = await this.ticketService.getOne(ticketId);

        return Review.find({
            where: {
                ticket: {
                    technician: {
                        id: ticket.technician.id
                    }
                }
            }
        });
    }

    async update(
        reviewId: Review['id'],
        updates: ReviewUpdateDto
    ): Promise<ReviewDto> {

        const review = await Review.findOneOrFail({
            where: {
                id: reviewId
            },
        });

        Review.merge(review, { ...updates });

        return review.save();
    }

    async delete(reviewId: Review['id']): Promise<void> {
        const review = await Review.findOneOrFail({
            where: {
                id: reviewId
            },
        });

        await review.remove();
    }
}