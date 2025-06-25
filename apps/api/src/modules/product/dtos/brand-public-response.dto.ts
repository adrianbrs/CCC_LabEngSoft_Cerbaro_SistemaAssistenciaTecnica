import { PublicEntityResponseDto } from '@/shared/public-entity-response.dto';
import { IBrandPublicResponse } from '@musat/core';
import { Column } from 'typeorm';

export class BrandPublicResponseDto
  extends PublicEntityResponseDto
  implements IBrandPublicResponse
{
  @Column({ type: 'varchar', length: 100 })
  name: string;
}
