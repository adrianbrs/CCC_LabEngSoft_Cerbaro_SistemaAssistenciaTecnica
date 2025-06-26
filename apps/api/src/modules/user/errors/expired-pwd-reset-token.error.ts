import { ApiError } from '@/shared/api.error';
import { HttpStatus } from '@nestjs/common';

export class ExpiredPwdResetToken extends ApiError {
  constructor() {
    super(
      'EXPIRED_PASSWORD_RESET_TOKEN',
      'Password reset token is expired or invalid.',
      HttpStatus.FORBIDDEN,
    );
  }
}
