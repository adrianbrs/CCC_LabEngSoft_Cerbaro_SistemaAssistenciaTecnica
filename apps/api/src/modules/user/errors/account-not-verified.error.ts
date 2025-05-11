import { ApiError } from '@/shared/api.error';
import { HttpStatus } from '@nestjs/common';

export class AccountNotVerifiedError extends ApiError {
  constructor() {
    super('ACCOUNT_NOT_VERIFIED', 'Account not verified', HttpStatus.FORBIDDEN);
  }
}
