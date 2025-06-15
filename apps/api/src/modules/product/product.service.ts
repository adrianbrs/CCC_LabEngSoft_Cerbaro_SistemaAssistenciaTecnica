import { Injectable, Logger } from '@nestjs/common';
import { ProductDto } from './dtos/product.dto';
import { Product } from './models/product.entity';
import { ProductUpdateDto } from './dtos/product-update.dto';
import { DataSource, ILike, Not } from 'typeorm';
import { ProductFiltersDto } from './dtos/product-filters.dto';
import { Paginated } from '@/shared/pagination';
import { DuplicateProductError } from './errors/duplicate-product.error';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(private readonly ds: DataSource) {
    this.logger.log('ProductService initialized');
  }

  async getAll(filters?: ProductFiltersDto): Promise<Paginated<Product>> {
    this.logger.log(`Fetching all products`, filters);

    const result = await Product.findAndCount({
      where: {
        ...(filters?.model && {
          model: ILike(`%${filters?.model}%`),
        }),
        ...(filters?.brandId && {
          brand: { id: filters?.brandId },
        }),
        ...(filters?.categoryId && {
          category: { id: filters?.categoryId },
        }),
      },
      ...filters?.getFindOptions(),
    });

    this.logger.log(`Found ${result[1]} products`, filters);

    return Paginated.from(result, filters);
  }

  async create(productDto: ProductDto): Promise<Product> {
    this.logger.log('Creating product', productDto);

    const { brandId, categoryId, model } = productDto;

    // Check for existing product with the same model, brand, and category
    const existingProduct = await Product.findOne({
      where: {
        model: ILike(model),
        brand: { id: brandId },
        category: { id: categoryId },
      },
    });

    if (existingProduct) {
      throw new DuplicateProductError(existingProduct);
    }

    const product = Product.create({
      model,
      brand: { id: brandId },
      category: { id: categoryId },
    });

    await product.save();

    this.logger.log(`Product ${product.id} created`);

    return product;
  }

  async update(
    productId: Product['id'],
    updates: ProductUpdateDto,
  ): Promise<Product> {
    this.logger.log(`Updating product ${productId}`);

    const product = await Product.findOneOrFail({
      where: {
        id: productId,
      },
    });

    // Check for existing product with the same model, brand, and category
    const existingProduct = await Product.findOne({
      where: {
        model: ILike(updates.model ?? product.model),
        brand: { id: updates.brandId ?? product.brand.id },
        category: { id: updates.categoryId ?? product.category.id },
        id: Not(productId), // Exclude the current product
      },
    });

    if (existingProduct) {
      throw new DuplicateProductError(existingProduct);
    }

    Product.merge(product, { ...updates });

    return product.save();
  }

  async delete(productId: Product['id']): Promise<void> {
    this.logger.log(`Deleting product with ID: ${productId}`);

    // Delete should not throw an error if the product does not exist
    const product = await Product.findOne({
      where: {
        id: productId,
      },
    });

    await product?.remove();
  }
}
