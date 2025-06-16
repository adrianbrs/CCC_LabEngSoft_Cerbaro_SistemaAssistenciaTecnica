import { ApiError } from '@/shared/errors';
import { HttpStatus } from '@nestjs/common';

export class InvalidCredentialsError extends ApiError {
  constructor() {
    super(
      'INVALID_CREDENTIALS',
      'Invalid credentials provided',
      HttpStatus.UNAUTHORIZED,
    );
  }
}
