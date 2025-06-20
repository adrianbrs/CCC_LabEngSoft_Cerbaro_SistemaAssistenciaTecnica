import { Injectable, Logger } from '@nestjs/common';
import { ProductDto } from './dtos/product.dto';
import { Product } from './models/product.entity';
import { ProductUpdateDto } from './dtos/product-update.dto';
import { ILike, Not } from 'typeorm';
import { ProductFiltersDto } from './dtos/product-filters.dto';
import { Paginated } from '@/shared/pagination';
import { DuplicateProductError } from './errors/duplicate-product.error';
import { CategoryService } from './category.service';
import { BrandService } from './brand.service';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    private readonly categoryService: CategoryService,
    private readonly brandService: BrandService,
  ) {
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

    return Product.findOneOrFail({ where: { id: product.id } });
  }

  async update(
    productId: Product['id'],
    updateDto: ProductUpdateDto,
  ): Promise<Product> {
    this.logger.log(`Updating product ${productId}`);
    const { categoryId, brandId, ...updates } = updateDto;

    const product = await Product.findOneOrFail({
      where: {
        id: productId,
      },
    });

    // Check for existing product with the same model and brand
    const existingProduct = await Product.findOne({
      where: {
        model: ILike(updates.model ?? product.model),
        brand: { id: brandId ?? product.brand.id },
        id: Not(productId), // Exclude the current product
      },
    });

    if (existingProduct) {
      throw new DuplicateProductError(existingProduct);
    }

    Product.merge(product, { ...updates });

    // Update relations
    if (categoryId && categoryId !== product.category.id) {
      product.category = await this.categoryService.getById(categoryId);
    }
    if (brandId && brandId !== product.brand.id) {
      product.brand = await this.brandService.getById(brandId);
    }

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
