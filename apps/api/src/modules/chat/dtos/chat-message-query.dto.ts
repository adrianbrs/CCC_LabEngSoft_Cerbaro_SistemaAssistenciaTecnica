import { PaginatedQueryDto } from '@/shared/pagination';
import { IMessageQuery } from '@musat/core';

export class ChatMessageQueryDto
  extends PaginatedQueryDto
  implements IMessageQuery {}
