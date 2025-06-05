import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './models/user.entity';
import { UserService } from './user.service';
import { UserTasksService } from './user-tasks.service';
import { TicketService } from '../ticket/ticket.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, UserTasksService],
  exports: [UserService],
})
export class UserModule {}
