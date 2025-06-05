import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './models/review.entity';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { TicketModule } from '../ticket/ticket.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review]),
    forwardRef(() => TicketModule),
    forwardRef(() => UserModule),
  ],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService], // 👈 exporta para que outros módulos possam usar
})
export class ReviewModule {}
