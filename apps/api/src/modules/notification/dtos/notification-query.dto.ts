import { PaginatedQueryDto } from '@/shared/pagination';
import { INotificationQuery } from '@musat/core';

export class NotificationQueryDto
  extends PaginatedQueryDto
  implements INotificationQuery {}
