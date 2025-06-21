import { ApiError } from '@/shared/errors';
import { HttpStatus } from '@nestjs/common';

export class CannotUpdateOwnRoleError extends ApiError {
  constructor() {
    super(
      'CANNOT_UPDATE_OWN_ROLE',
      'You cannot update your own role.',
      HttpStatus.FORBIDDEN,
    );
  }
}
