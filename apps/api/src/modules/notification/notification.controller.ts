import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { User } from '@/modules/user/models/user.entity';
import { NotificationService } from './notification.service';
import { LoggedUser } from '../auth/auth.decorator';
import { NotificationQueryDto } from './dtos/notification-query.dto';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}
  /**
   * Gets all notifications of the currently logged user
   */
  @Get('/me')
  async getMyNotifications(
    @LoggedUser() client: User,
    @Query() query: NotificationQueryDto,
  ) {
    return this.notificationService.getMine(client, query);
  }

  @Get('/:id')
  async getOne(
    @LoggedUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.notificationService.getOne(user, id);
  }

  @Delete('/:id')
  async delete(
    @LoggedUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.notificationService.deleteOne(user, id);
  }
}
