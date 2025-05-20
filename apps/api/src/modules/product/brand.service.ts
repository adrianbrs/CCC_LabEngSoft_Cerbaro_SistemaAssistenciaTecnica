import { Injectable, Logger } from '@nestjs/common';
import { Brand } from './models/brand.entity';
import { BrandDto } from './dtos/brand.dto'
import { BrandUpdateDto } from './dtos/brand-update.dto';

@Injectable()
export class BrandService {
    private readonly logger = new Logger(BrandService.name);

    async create(brandDto: BrandDto): Promise<Brand> {
        this.logger.log("Registering new brand");

        const brand = Brand.create({
            ...brandDto
        });

        await brand.save()

        return brand;

    }

    async getBrandByName(name: string): Promise<Brand> {
        this.logger.log(`Fetching brand with name: ${name}`);

        const brand = await Brand.findOneOrFail({
            where: {
                name
            }
        });

        this.logger.log(`Brand found: ${JSON.stringify(brand)}`);
        return brand;
    }

    async update(brandId: Brand['id'], updates: BrandUpdateDto): Promise<Brand> {
        this.logger.log(`Updating brand ${brandId}`);

        const brand = await Brand.findOneOrFail({
            where: {
                id: brandId
            }
        })

        Brand.merge(brand, { ...updates })

        return brand.save();
    }



}