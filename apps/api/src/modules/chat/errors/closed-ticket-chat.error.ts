import { ApiError } from '@/shared/errors';
import { HttpStatus } from '@nestjs/common';

export class ClosedTicketChatError extends ApiError {
  constructor() {
    super(
      'CLOSED_TICKET_CHAT',
      'This ticket is closed and cannot receive new messages',
      HttpStatus.FORBIDDEN,
    );
  }
}
