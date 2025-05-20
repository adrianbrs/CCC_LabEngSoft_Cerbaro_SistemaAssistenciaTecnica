import { Injectable, Logger } from "@nestjs/common";
import { ProductDto } from "./dtos/product.dto";
import { Product } from "./models/product.entity";
import { ProductUpdateDto } from "./dtos/product-update.dto";
import { Brand } from "./models/brand.entity";
import { Category } from "./models/category.entity";
import { DataSource } from "typeorm";

@Injectable()
export class ProductService {
    private readonly logger = new Logger(ProductService.name);

    constructor(private readonly ds: DataSource) {
        this.logger.log('ProductService initialized');
        
    }

    async create(productDto: ProductDto): Promise<Product> {
        this.logger.log('Creating product');

        return this.ds.transaction(async (manager) => {
            const {
                brand: brandData,
                category: categoryData,
                ...productData
            } = productDto;

            // Verifica se brand já existe — ou cria novo
            let brand = await manager.findOne(Brand, {
                where: { name: brandData.name },
            });

            if (!brand) {
                brand = manager.create(Brand, brandData);
                await manager.save(brand);
            }

            // Verifica se category já existe — ou cria novo
            let category = await manager.findOne(Category, {
                where: { name: categoryData.name },
            });

            if (!category) {
                category = manager.create(Category, categoryData);
                await manager.save(category);
            }

            // Cria e salva o produto
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
}