import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './models/product.entity';
import { Category } from './models/category.entity';
import { Brand } from './models/brand.entity';
import { BrandController } from './brand.controller';
import { BrandService } from './brand.service';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category, Brand])],
  controllers: [ProductController, BrandController, CategoryController],
  providers: [BrandService, CategoryService],
})
export class ProductModule { }
