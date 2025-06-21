import { ICoreEntity } from '@musat/core';
import { Exclude } from 'class-transformer';
import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  FindManyOptions,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Paginated, PaginatedQueryDto } from './pagination';

export abstract class CoreEntity extends BaseEntity implements ICoreEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Exclude()
  @DeleteDateColumn()
  deletedAt: Date | null;

  static async findPaginated<T extends BaseEntity>(
    this: {
      new (): T;
    } & typeof BaseEntity,
    options?: FindManyOptions<T>,
    query?: Partial<PaginatedQueryDto>,
  ): Promise<Paginated<T>> {
    const result = await this.findAndCount({
      ...options,
      skip: query?.skip ?? 0,
      take: query?.limit ?? 100,
    });

    return Paginated.from(result, query);
  }
}
