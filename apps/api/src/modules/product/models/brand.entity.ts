import { CoreEntity } from '@/shared/core.entity';
import { IBrandEntity } from '@musat/core';
import { Column, Entity, OneToMany } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class Brand extends CoreEntity implements IBrandEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 14, nullable: false })
  phone: string;

  @OneToMany(() => Product, (product) => product.brand)
  products?: Product[];
}
