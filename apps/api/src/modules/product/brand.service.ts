import { Injectable, Logger } from '@nestjs/common';
import { Brand } from './models/brand.entity';
import { BrandDto } from './dtos/brand.dto';
import { BrandUpdateDto } from './dtos/brand-update.dto';
import { BrandQueryDto } from './dtos/brand-query.dto';
import { ILike, Not } from 'typeorm';
import { Paginated } from '@/shared/pagination';
import { DuplicateBrandError } from './errors/duplicate-brand.error';
import { Product } from './models/product.entity';
import { CollectionNotEmptyError } from '@/shared/errors';

@Injectable()
export class BrandService {
  private readonly logger = new Logger(BrandService.name);

  async create(brandDto: BrandDto): Promise<Brand> {
    // Avoid logging sensitive information
    this.logger.log('Creating new brand', { name: brandDto.name });

    // Check for existing brand with the same name
    const existingBrand = await Brand.findOne({
      where: {
        name: ILike(brandDto.name),
      },
    });

    if (existingBrand) {
      throw new DuplicateBrandError(existingBrand);
    }

    const brand = Brand.create({
      ...brandDto,
    });

    return brand.save();
  }

  async getById(brandId: Brand['id']): Promise<Brand> {
    this.logger.log(`Fetching brand with ID: ${brandId}`);
    const brand = await Brand.findOneOrFail({
      where: {
        id: brandId,
      },
    });
    // Avoid logging sensitive information
    this.logger.log('Brand found', { id: brand.id, name: brand.name });
    return brand;
  }

  async getAll(query?: BrandQueryDto): Promise<Paginated<Brand>> {
    this.logger.log('Fetching all brands', query);

    const result = await Brand.findPaginated(
      {
        where: {
          ...(query?.name && {
            name: ILike(`%${query.name}%`),
          }),
          ...(query?.categoryId && {
            products: {
              category: {
                id: query.categoryId,
              },
            },
          }),
        },
      },
      query,
    );

    this.logger.log(`Found ${result.totalItems} brands`, query);

    return result;
  }

  async update(brandId: Brand['id'], updates: BrandUpdateDto): Promise<Brand> {
    this.logger.log(`Updating brand ${brandId}`);

    // Check for existing brand with the same name
    if (updates.name) {
      const existingBrand = await Brand.findOne({
        where: {
          name: ILike(updates.name),
          id: Not(brandId), // Ensure we don't match the current brand
        },
      });

      if (existingBrand) {
        throw new DuplicateBrandError(existingBrand);
      }
    }

    const brand = await Brand.findOneOrFail({
      where: {
        id: brandId,
      },
    });

    Brand.merge(brand, { ...updates });

    return brand.save();
  }

  async delete(brandId: Brand['id']): Promise<void> {
    this.logger.log(`Deleting brand with ID: ${brandId}`);

    // Delete should not throw an error if the brand does not exist
    const brand = await Brand.findOne({
      where: {
        id: brandId,
      },
    });

    if (brand) {
      // Check if there are any products associated with this brand
      const hasProducts = await Product.exists({
        where: {
          brand: {
            id: brand.id,
          },
        },
      });

      if (hasProducts) {
        this.logger.warn(
          `Brand with ID ${brandId} cannot be deleted because it has associated products.`,
        );
        throw new CollectionNotEmptyError(brand);
      }
    }

    await brand?.softRemove();
  }
}
