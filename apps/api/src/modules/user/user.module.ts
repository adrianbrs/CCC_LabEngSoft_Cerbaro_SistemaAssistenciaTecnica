import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './models/user.entity';
import { UserService } from './user.service';
import { Address } from './models/address.entity';
import { UserTasksService } from './user-tasks.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Address])],
  controllers: [UserController],
  providers: [UserService, UserTasksService],
  exports: [UserService],
})
export class UserModule {}
