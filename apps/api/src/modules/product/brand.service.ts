import { Injectable, Logger } from '@nestjs/common';
import { Brand } from './models/brand.entity';
import { BrandDto } from './dtos/brand.dto';
import { BrandUpdateDto } from './dtos/brand-update.dto';
import { BrandFiltersDto } from './dtos/brand-filters.dto';
import { ILike, Not } from 'typeorm';
import { Paginated } from '@/shared/pagination';
import { DuplicateBrandError } from './errors/duplicate-brand.error';

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

  async getAll(filters?: BrandFiltersDto): Promise<Paginated<Brand>> {
    this.logger.log('Fetching all brands', filters);

    const result = await Brand.findAndCount({
      where: {
        ...(filters?.name && {
          name: ILike(`%${filters.name}%`),
        }),
        ...(filters?.categoryId && {
          products: {
            category: {
              id: filters.categoryId,
            },
          },
        }),
      },
      ...filters?.getFindOptions(),
    });

    this.logger.log(`Found ${result[1]} brands`, filters);

    return Paginated.from(result, filters);
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

    await brand?.softRemove();
  }
}
