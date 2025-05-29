import { Injectable, Logger } from '@nestjs/common';
import { Brand } from './models/brand.entity';
import { BrandDto } from './dtos/brand.dto';
import { BrandUpdateDto } from './dtos/brand-update.dto';
import { BrandFiltersDto } from './dtos/brand-filters.dto';
import { ILike } from 'typeorm';

@Injectable()
export class BrandService {
  private readonly logger = new Logger(BrandService.name);

  async create(brandDto: BrandDto): Promise<Brand> {
    this.logger.log('Registering new brand');

    const brand = Brand.create({
      ...brandDto,
    });

    await brand.save();

    return brand;
  }

  async getAll(filters?: BrandFiltersDto): Promise<Brand[]> {
    this.logger.log(`Fetching all brands`, filters);

    const brands = await Brand.find({
      where: {
        ...(filters?.name && {
          name: ILike(`%${filters.name}%`),
        }),
      },
    });

    this.logger.log(`Found ${brands.length} brands`);
    return brands;
  }

  async update(brandId: Brand['id'], updates: BrandUpdateDto): Promise<Brand> {
    this.logger.log(`Updating brand ${brandId}`);

    const brand = await Brand.findOneOrFail({
      where: {
        id: brandId,
      },
    });

    Brand.merge(brand, { ...updates });

    return brand.save();
  }
}
