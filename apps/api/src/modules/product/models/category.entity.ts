import { CoreEntity } from '@/shared/core.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { ICategoryEntity } from '@musat/core';
import { Product } from './product.entity';

@Entity()
export class Category extends CoreEntity implements ICategoryEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @OneToMany(() => Product, (product) => product.category)
  products?: Product[];
}
