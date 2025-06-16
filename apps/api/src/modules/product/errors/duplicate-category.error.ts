import { ApiError } from '@/shared/errors';
import { HttpStatus } from '@nestjs/common';
import { Category } from '../models/category.entity';

export class DuplicateCategoryError extends ApiError {
  constructor(category: Category) {
    super(
      'DUPLICATE_CATEGORY',
      `Category with name "${category.name}" already exists.`,
      HttpStatus.CONFLICT,
      {
        category,
      },
    );
  }
}
