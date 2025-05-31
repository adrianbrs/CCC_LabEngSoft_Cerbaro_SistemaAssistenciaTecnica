import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ReviewService } from "./review.service";
import { ReviewUpdateDto } from "./dtos/review-update.dto";
import { Review } from "./models/review.entity";
import { UserDto } from "../user/dtos/user.dto";

@Controller('reviews')
export class ReviewController {
    constructor(private readonly reviewService: ReviewService){}

    /**
     * 
     * returns all reviews
     */
    @Get()
    async getAll(){
        return this.reviewService.getAll();
    }

    /**
     * 
     * returns one review based on its ID 
     */
    @Get(':id')
    async getOne(@Param('id') id: string){
        return this.reviewService.getOne(id);
    }

    /**
     *
     *returns all reviews written by a specific client 
     * 
     */
    @Get('/client/:userId')
    async getByClient(
        @Param('userId') userId: string, 
    ){
        return this.reviewService.getByClient(userId);
    }

    /**
     * 
     * returns all reviews for tickets where a technician worked
     * 
     */
    @Get('/technician/:techId')
    async getByTechnician(
        @Param('techId') techId: string
    ){
        return this.reviewService.getByTechnician(techId);
    }

    @Post()
    async create(
        @Param('ticketId') ticketId: string,
    ){
        return this.reviewService.create(ticketId);
    }

    @Patch(':id')
    async update(
        reviewId: Review['id'],
        updates: ReviewUpdateDto
    ){
        return this.reviewService.update(reviewId, updates);
    }

    /**
     * Deletes a review
     */
    @Delete(':id')
    async delete(@Param('id') id: string){
        return this.reviewService.delete(id);
    }
}