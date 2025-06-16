import { ApiError } from '@/shared/errors';
import { HttpStatus } from '@nestjs/common';

export class MissingVerificationTokenError extends ApiError {
  constructor() {
    super(
      'MISSING_VERIFICATION_TOKEN',
      'Missing verification token',
      HttpStatus.BAD_REQUEST,
    );
  }
}
