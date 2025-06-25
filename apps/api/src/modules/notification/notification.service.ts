import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { Notification } from './models/notification.entity';
import { NotificationCreateDto } from './dtos/notification-create.dto';
import { User } from '@/modules/user/models/user.entity';
import { Paginated } from '@/shared/pagination';
import { NotificationResponseDto } from './dtos/notification-response.dto';
import { NotificationQueryDto } from './dtos/notification-query.dto';
import { NotificationReadEventDto } from './dtos/notification-read-event.dto';
import { NotificationGateway } from './notification.gateway';
import { DataSource, In } from 'typeorm';
import { NotificationDeleteEventDto } from './dtos/notification-delete-event.dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @Inject(forwardRef(() => NotificationGateway))
    private readonly notificationGateway: NotificationGateway,
    private readonly ds: DataSource,
  ) {}

  async getMine(
    crrUser: User,
    query?: NotificationQueryDto,
  ): Promise<Paginated<NotificationResponseDto>> {
    const notifications = await Notification.findPaginated(
      {
        where: {
          user: {
            id: crrUser.id,
          },
        },
        order: {
          createdAt: 'DESC',
        },
      },
      query,
    );

    return notifications.map((notification) =>
      NotificationResponseDto.create({
        ...notification,
      }),
    );
  }

  async getOne(
    user: User,
    notificationId: Notification['id'],
  ): Promise<Notification> {
    return Notification.findOneOrFail({
      where: {
        id: notificationId,
        user: {
          id: user.id,
        },
      },
    });
  }

  async createOne(
    notificationDto: NotificationCreateDto,
  ): Promise<Notification> {
    const { userId, ...notificationData } = notificationDto;

    const user = await User.findOneOrFail({
      where: {
        id: userId,
      },
    });

    const notification = Notification.create({
      ...notificationData,
      user,
    });

    await Notification.save(notification);

    this.notificationGateway.sendNotification(user, notification);

    return notification;
  }

  async deleteOne(
    user: User,
    notificationId: Notification['id'],
  ): Promise<void> {
    const notification = await Notification.findOneOrFail({
      where: {
        id: notificationId,
        user: {
          id: user.id,
        },
      },
    });

    await notification.softRemove();
  }

  async deleteMany(
    user: User,
    event: NotificationDeleteEventDto,
  ): Promise<NotificationDeleteEventDto> {
    this.logger.log(`Deleting notifications for user ${user.id}`, {
      notificationIds: event.notificationIds,
    });

    const notifications = await Notification.find({
      where: {
        id: In(event.notificationIds),
        user: {
          id: user.id,
        },
      },
      select: {
        id: true,
        user: {
          id: true,
        },
      },
    });

    if (!notifications.length) {
      this.logger.log(`No notifications found for user ${user.id}`);
      return NotificationDeleteEventDto.create({
        notificationIds: [],
      });
    }

    await Notification.softRemove(notifications);

    this.logger.log(
      `Deleted ${notifications.length} notifications for user ${user.id}`,
    );

    return NotificationDeleteEventDto.create({
      notificationIds: notifications.map((n) => n.id),
    });
  }

  async read(
    user: User,
    event: NotificationReadEventDto,
  ): Promise<NotificationReadEventDto> {
    this.logger.log(`Marking notifications as read by ${user.id}`, {
      notifications: event.notificationIds,
    });

    const { notificationIds } = event;

    const notifications = await Notification.find({
      where: {
        id: In(notificationIds),
        user: {
          id: user.id,
        },
        read: false, // Only mark unread messages as read
      },
      select: {
        user: false,
      },
    });

    const filteredIds = notifications.map((m) => m.id);

    if (!filteredIds.length) {
      this.logger.log(`No unread notifications found for user ${user.id}`);
      return NotificationReadEventDto.create({
        notificationIds: [],
      });
    }

    return this.ds.transaction(async (manager) => {
      await manager.update(
        Notification,
        {
          id: In(filteredIds),
        },
        {
          read: true,
        },
      );

      const response = NotificationReadEventDto.create({
        notificationIds: filteredIds,
      });

      return response;
    });
  }
}
