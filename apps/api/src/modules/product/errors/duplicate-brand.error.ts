import { ApiError } from '@/shared/errors';
import { HttpStatus } from '@nestjs/common';
import { Brand } from '../models/brand.entity';

export class DuplicateBrandError extends ApiError {
  constructor(brand: Brand) {
    super(
      'DUPLICATE_BRAND',
      `Brand with name "${brand.name}" already exists.`,
      HttpStatus.CONFLICT,
      {
        brand,
      },
    );
  }
}
