import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './models/review.entity';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { TicketModule } from '../ticket/ticket.module';
import { UserModule } from '../user/user.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review]),
    forwardRef(() => TicketModule),
    forwardRef(() => UserModule),
    //forwardRef(()=> NotificationModule)
  ],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService], 
})
export class ReviewModule {}
