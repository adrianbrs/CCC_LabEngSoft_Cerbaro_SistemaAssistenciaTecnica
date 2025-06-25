import { ICoreEntity } from '@musat/core';
import { ResponseDto } from './response.dto';
import { Expose } from 'class-transformer';

export class PublicEntityResponseDto
  extends ResponseDto
  implements Pick<ICoreEntity, 'id'>
{
  @Expose()
  id: string;
}
