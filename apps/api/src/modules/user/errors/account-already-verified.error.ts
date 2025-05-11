import { ApiError } from '@/shared/api.error';
import { HttpStatus } from '@nestjs/common';

export class AccountAlreadyVerifiedError extends ApiError {
  constructor() {
    super(
      'ACCOUNT_ALREADY_VERIFIED',
      'Account already verified',
      HttpStatus.BAD_REQUEST,
    );
  }
}
