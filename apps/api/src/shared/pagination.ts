import {
  IPaginatedEntity,
  IPaginatedOptions,
  IPaginatedQuery,
} from '@musat/core';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance } from 'class-transformer';
import { IsArray, IsNumber, Max, Min } from 'class-validator';
import { FindManyOptions } from 'typeorm';

export class Paginated<T> implements IPaginatedEntity<T> {
  @IsArray()
  readonly items: T[];

  @Min(1)
  @IsNumber()
  readonly page: number;

  @Min(1)
  @Max(500)
  readonly limit: number;

  @IsNumber()
  readonly totalItems: number;

  @Expose()
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.limit);
  }

  @Expose()
  get hasNextPage(): boolean {
    return this.page < this.totalPages;
  }

  @Expose()
  get hasPrevPage(): boolean {
    return this.page > 1;
  }

  static from<T>(
    data: [items: T[], totalItems: number],
    query?: IPaginatedQuery,
  ): Paginated<T>;
  static from<T>(options: IPaginatedOptions<T>): Paginated<T>;
  static from<T>(
    optionsOrTuple: IPaginatedOptions<T> | [items: T[], totalItems: number],
    query?: IPaginatedQuery,
  ): Paginated<T> {
    if (Array.isArray(optionsOrTuple)) {
      const [items, totalItems] = optionsOrTuple;
      const { page = 1, limit = Math.max(100, totalItems) } = query || {};
      return Paginated.from({
        items,
        page,
        limit,
        totalItems,
      });
    }

    return plainToInstance(Paginated<T>, optionsOrTuple, {
      exposeDefaultValues: true,
    });
  }
}

export class PaginatedQueryDto implements IPaginatedQuery {
  @Min(1)
  @IsNumber()
  @ApiProperty({ default: 1, type: Number })
  page: number = 1;

  @Min(1)
  @Max(500)
  @IsNumber()
  @ApiProperty({ default: 100, type: Number, maximum: 500 })
  limit: number = 100;

  get skip(): number {
    return (this.page - 1) * this.limit;
  }

  getFindOptions(): Pick<FindManyOptions, 'skip' | 'take'> {
    return {
      skip: this.skip,
      take: this.limit,
    };
  }
}
