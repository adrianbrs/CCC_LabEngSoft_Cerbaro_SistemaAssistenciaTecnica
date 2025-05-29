import { CoreEntity } from '@/shared/core.entity';
import { Column, Entity } from 'typeorm';
import { ICategoryEntity} from '@musat/core';

@Entity()
export class Category extends CoreEntity implements ICategoryEntity{
    @Column({ type: 'varchar', length: 100 })
    name: string;
}
