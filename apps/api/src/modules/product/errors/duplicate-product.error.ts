import { ApiError } from '@/shared/errors';
import { HttpStatus } from '@nestjs/common';
import { Product } from '../models/product.entity';

export class DuplicateProductError extends ApiError {
  constructor(product: Product) {
    super(
      'DUPLICATE_PRODUCT',
      `Product model "${product.model}", from brand "${product.brand.name}" and category "${product.category.name}" already exists.`,
      HttpStatus.CONFLICT,
      {
        product,
      },
    );
  }
}
