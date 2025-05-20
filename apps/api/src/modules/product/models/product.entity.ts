import { CoreEntity } from '@/shared/core.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Category } from './category.entity';
import { Brand } from './brand.entity';
import { IProductEntity } from '@musat/core';

@Entity()
export class Product extends CoreEntity implements IProductEntity{
	@ManyToOne(() => Category, { eager: true })
  	category: Category;

  	@ManyToOne(() => Brand, { eager: true })
  	brand: Brand;

  	@Column({ type: 'varchar', length: 100 })
  	model: string;
}
