import { CoreEntity } from '@/shared/core.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Category } from './category.entity';
import { Brand } from './brand.entity';
import { IProductEntity } from '@musat/core';

@Entity()
// Should not allow duplicate products with the same model and brand
@Index(['model', 'brand'], { unique: true })
export class Product extends CoreEntity implements IProductEntity {
  @ManyToOne(() => Category, { eager: true })
  @JoinColumn()
  category: Category;

  @ManyToOne(() => Brand, { eager: true })
  @JoinColumn()
  brand: Brand;

  @Column({ type: 'varchar', length: 100 })
  model: string;
}
