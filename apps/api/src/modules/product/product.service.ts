import { Injectable, Logger } from "@nestjs/common";
import { ProductDto } from "./dtos/product.dto";
import { Product } from "./models/product.entity";
import { ProductUpdateDto } from "./dtos/product-update.dto";

@Injectable()
export class ProductService {
    private readonly logger = new Logger(ProductService.name);

    constructor() {
        this.logger.log('ProductService initialized');
    }

    async create(productDto: ProductDto): Promise<ProductDto> {
        const product = Product.create({
            ...productDto
        });

        await Product.save(product);

        return product;
    }

    async getAll(){
        
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