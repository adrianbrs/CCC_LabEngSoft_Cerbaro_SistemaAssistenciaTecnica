import { ApiError } from '@/shared/errors';
import { HttpStatus } from '@nestjs/common';

export class NoTechniciansAvailableError extends ApiError {
  constructor() {
    super(
      'NO_TECHNICIANS_AVAILABLE',
      'No technicians available to handle this ticket.',
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}
