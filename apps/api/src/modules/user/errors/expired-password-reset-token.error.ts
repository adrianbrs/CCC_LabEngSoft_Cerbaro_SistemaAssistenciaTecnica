import { ApiError } from '@/shared/errors';
import { HttpStatus } from '@nestjs/common';

export class ExpiredPasswordResetToken extends ApiError {
  constructor() {
    super(
      'EXPIRED_PASSWORD_RESET_TOKEN',
      'Password reset token is expired or invalid.',
      HttpStatus.FORBIDDEN,
    );
  }
}
