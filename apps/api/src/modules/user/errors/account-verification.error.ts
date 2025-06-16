import { ApiError } from '@/shared/errors';
import { HttpStatus } from '@nestjs/common';

export class AccountVerificationError extends ApiError {
  constructor() {
    super(
      'ACCOUNT_VERIFICATION_ERROR',
      'Account verification error',
      HttpStatus.BAD_REQUEST,
    );
  }
}
