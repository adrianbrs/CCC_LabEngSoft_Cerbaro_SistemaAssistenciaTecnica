import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewUpdateDto } from './dtos/review-update.dto';
import { Review } from './models/review.entity';
import { LoggedUser } from '../auth/auth.decorator';
import { User } from '../user/models/user.entity';
import { ReviewCreateDto } from './dtos/review-create.dto';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  /**
   *
   * returns all reviews
   */
  @Get()
  //  @Authorize(UserRole.ADMIN)
  async getAll() {
    return this.reviewService.getAll();
  }

  @Get('/ticket/:id')
  async getByTicket(@Param('id', ParseUUIDPipe) id: string) {
    return this.reviewService.getByTicket(id);
  }

  /**
   *
   *returns all reviews written by a specific client
   *
   */
  @Get('/client/:userId')
  async getByClient(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.reviewService.getByClient(userId);
  }

  /**
   *
   * returns all reviews for tickets where a technician worked
   *
   */
  @Get('/technician/:techId')
  async getByTechnician(@Param('techId') techId: string) {
    return this.reviewService.getByTechnician(techId);
  }

  @Post(':ticketId')
  async create(
    @LoggedUser() user: User,
    @Param('ticketId') ticketId: string,
    @Body() reviewDto: ReviewCreateDto,
  ) {
    return this.reviewService.create(ticketId, user, reviewDto);
  }

  @Patch(':id')
  async update(reviewId: Review['id'], updates: ReviewUpdateDto) {
    return this.reviewService.update(reviewId, updates);
  }

  /**
   * Deletes a review
   */
  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.reviewService.delete(id);
  }
}
