import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './models/review.entity';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { TicketService } from '../ticket/ticket.service';

@Module({
  imports: [TypeOrmModule.forFeature([Review])],
  controllers: [ReviewController], 
  providers: [ReviewService, TicketService],
})
export class ReviewModule {}
