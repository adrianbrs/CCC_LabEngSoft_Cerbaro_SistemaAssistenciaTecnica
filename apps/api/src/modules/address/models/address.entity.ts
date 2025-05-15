import { CoreEntity } from '@/shared/core.entity';
import { IAddressEntity } from '@musat/core';
import { Column, Entity } from 'typeorm';

@Entity()
export class Address extends CoreEntity implements IAddressEntity {
  @Column({ type: 'varchar', length: 255 })
  street: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  number: string | null;

  @Column({ type: 'varchar', length: 100 })
  neighborhood: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  complement: string | null;

  @Column({ type: 'varchar', length: 64 })
  city: string;

  @Column({ type: 'varchar', length: 2 })
  state: string;

  @Column({ type: 'varchar', length: 8 })
  zipCode: string;
}
