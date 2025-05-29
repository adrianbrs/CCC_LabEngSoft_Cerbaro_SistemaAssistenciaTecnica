import { CoreEntity } from '@/shared/core.entity';
import { IBrandEntity } from '@musat/core';
import { Column, Entity, Index } from 'typeorm';

@Entity()
export class Brand extends CoreEntity implements IBrandEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 14, nullable: false })
  phone: string;
}