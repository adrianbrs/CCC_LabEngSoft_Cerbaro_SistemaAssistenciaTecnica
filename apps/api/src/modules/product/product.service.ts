import { Injectable, Logger } from "@nestjs/common";
import { ProductDto } from "./dtos/product.dto";
import { Product } from "./models/product.entity";
import { ProductUpdateDto } from "./dtos/product-update.dto";
import { Brand } from "./models/brand.entity";
import { Category } from "./models/category.entity";
import { DataSource, ILike } from "typeorm";
import { ProductFiltersDto } from "./dtos/product-filters.dto";

@Injectable()
export class ProductService {
    private readonly logger = new Logger(ProductService.name);

    constructor(private readonly ds: DataSource) {
        this.logger.log('ProductService initialized');
        
    }

    async getAll(filters?: ProductFiltersDto): Promise<ProductDto[]>{
        this.logger.log(`Fetching all products`, filters);

        const products = await Product.find({
                where: {
                    ...(filters?.model && {
                        model: ILike(`%${filters.model}%`)
                    }),
                },
            });

        return products;
    }

    async create(productDto: ProductDto): Promise<Product> {
        this.logger.log('Creating product');

        return this.ds.transaction(async (manager) => {
            const {
                brand: brandData,
                category: categoryData,
                ...productData
            } = productDto;

            let brand = await manager.findOne(Brand, {
                where: { name: brandData.name },
            });

            if (!brand) {
                brand = manager.create(Brand, brandData);
                await manager.save(brand);
            }

            let category = await manager.findOne(Category, {
                where: { name: categoryData.name },
            });

            if (!category) {
                category = manager.create(Category, categoryData);
                await manager.save(category);
            }

            const product = manager.create(Product, {
                ...productData,
                brand,
                category,
            });

            await manager.save(product);

            this.logger.log(`Product ${product.id} created`);
            return product;
        });
    }


    async update(productId: Product['id'], updates: ProductUpdateDto): Promise<ProductDto> {
        this.logger.log(`Updating product ${productId}`);

        const product = await Product.findOneOrFail({
            where: {
                id: productId
            }
        });

        Product.merge(product, { ...updates });

        return product.save();
    }

    async delete(productId: Product['id']): Promise<void> {
        this.logger.log(`Deleting product with ID: ${productId}`);
    
        const product = await Product.findOneOrFail({
          where: {
            id: productId
          }
        });
        await product.remove();
        this.logger.log(`Product with ID: ${productId} deleted`);
    
      }
}