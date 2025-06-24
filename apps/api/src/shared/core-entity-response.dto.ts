import { ICoreEntity } from '@musat/core';
import { ResponseDto } from './response.dto';
import { Exclude, Expose } from 'class-transformer';

export class CoreEntityResponseDto extends ResponseDto implements ICoreEntity {
  @Expose()
  id: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Exclude()
  deletedAt: Date | null;
}
