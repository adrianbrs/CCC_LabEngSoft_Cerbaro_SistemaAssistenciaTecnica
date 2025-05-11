import { ApiError } from '@/shared/api.error';
import { HttpStatus } from '@nestjs/common';

export class InvalidCredentialsError extends ApiError {
  constructor() {
    super(
      'INVALID_CREDENTIALS',
      'Invalid credentials provided',
      HttpStatus.BAD_REQUEST,
    );
  }
}
