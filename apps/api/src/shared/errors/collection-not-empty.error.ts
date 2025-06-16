import { ApiError } from '@/shared/errors';
import { ICoreEntity } from '@musat/core';
import { HttpStatus } from '@nestjs/common';

export class CollectionNotEmptyError extends ApiError {
  constructor(collection: ICoreEntity) {
    super(
      'COLLECTION_NOT_EMPTY',
      `The collection with ID "${collection.id}" is not empty.`,
      HttpStatus.CONFLICT,
      {
        collection,
      },
    );
  }
}
