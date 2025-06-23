import { Injectable, Logger } from '@nestjs/common';
import { CategoryDto } from './dtos/category.dto';
import { Category } from './models/category.entity';
import { CategoryUpdateDto } from './dtos/category-update.dto';
import { CategoryQueryDto } from './dtos/category-query.dto';
import { ILike, Not } from 'typeorm';
import { Paginated } from '@/shared/pagination';
import { DuplicateCategoryError } from './errors/duplicate-category.error';
import { CollectionNotEmptyError } from '@/shared/errors';
import { Product } from './models/product.entity';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  async getAll(query?: CategoryQueryDto): Promise<Paginated<Category>> {
    this.logger.log(`Fetching all categories`, query);

    const result = await Category.findPaginated(
      {
        where: {
          ...(query?.name && {
            name: ILike(`%${query?.name}%`),
          }),
          ...(query?.brandId && {
            products: {
              brand: {
                id: query.brandId,
              },
            },
          }),
        },
      },
      query,
    );

    this.logger.log(`Found ${result.totalItems} categories`, query);

    return result;
  }

  async getById(categoryId: Category['id']): Promise<Category> {
    this.logger.log(`Fetching category with ID: ${categoryId}`);
    const category = await Category.findOneOrFail({
      where: {
        id: categoryId,
      },
    });
    this.logger.log('Category found', category);
    return category;
  }

  async create(categoryDto: CategoryDto): Promise<Category> {
    this.logger.log('Creating new category', categoryDto);

    // Check for category with the same name
    const existingCategory = await Category.findOne({
      where: {
        name: ILike(categoryDto.name),
      },
    });

    if (existingCategory) {
      throw new DuplicateCategoryError(existingCategory);
    }

    const category = Category.create({
      ...categoryDto,
    });

    await Category.save(category);

    return category;
  }

  async update(
    categoryId: Category['id'],
    updates: CategoryUpdateDto,
  ): Promise<Category> {
    this.logger.log(`Updating category ${categoryId}`, updates);

    // Check for category with the same name
    if (updates.name) {
      const existingCategory = await Category.findOne({
        where: {
          name: ILike(updates.name),
          id: Not(categoryId), // Ensure we don't match the current category
        },
      });

      if (existingCategory) {
        throw new DuplicateCategoryError(existingCategory);
      }
    }

    const category = await Category.findOneOrFail({
      where: {
        id: categoryId,
      },
    });

    Category.merge(category, { ...updates });

    return category.save();
  }

  async delete(categoryId: Category['id']): Promise<void> {
    this.logger.log(`Deleting category with ID: ${categoryId}`);

    // Delete should not throw an error if the category does not exist
    const category = await Category.findOne({
      where: {
        id: categoryId,
      },
    });

    if (category) {
      // Check if there are any products associated with this brand
      const hasProducts = await Product.exists({
        where: {
          category: {
            id: category.id,
          },
        },
      });

      if (hasProducts) {
        this.logger.warn(
          `Category with ID ${category.id} cannot be deleted because it has associated products.`,
        );
        throw new CollectionNotEmptyError(category);
      }
    }

    await category?.softRemove();
  }
}
