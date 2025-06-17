import { Injectable } from '@nestjs/common';
import { Notification } from './models/notification.entity';
import { NotificationDto } from './dtos/notification.dto';
import { NotificationCreateDto } from './dtos/notification-create.dto';
import { User } from '@/modules/user/models/user.entity';

@Injectable()
export class NotificationService {

    async getMine(crrUser: User): Promise<NotificationDto[]> {
        const notifications = await Notification.find({
            where: {
                user: {
                    id: crrUser.id,
                },
            },
        });

        return notifications;
    }

    async getOne(notificationId: Notification['id']): Promise<Notification> {
        return Notification.findOneOrFail({
            where: {
                id: notificationId,
            },
        });
    }

    async create(notificationDto: NotificationCreateDto): Promise<Notification> {
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

        return notification;
    }

    async delete(notificationId: Notification['id']): Promise<void> {
        const notification = await Notification.findOneOrFail({
            where: {
                id: notificationId,
            },
        });

        await Notification.remove(notification);
    }
}
