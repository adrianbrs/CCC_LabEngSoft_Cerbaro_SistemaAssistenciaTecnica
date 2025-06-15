import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './models/product.entity';
import { ProductDto } from './dtos/product.dto';
import { ProductUpdateDto } from './dtos/product-update.dto';
import { ProductFiltersDto } from './dtos/product-filters.dto';
import { Authorize } from '../auth/auth.decorator';
import { UserRole } from '@musat/core';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getAll(@Query() filters: ProductFiltersDto) {
    return this.productService.getAll(filters);
  }

  @Get(':id')
  @Authorize(UserRole.TECHNICIAN)
  async getOne(@Param('id') id: string) {
    return Product.findOneOrFail({ where: { id } });
  }

  @Post()
  @Authorize(UserRole.ADMIN)
  async createOne(@Body() productDto: ProductDto) {
    return this.productService.create(productDto);
  }

  @Patch(':id')
  @Authorize(UserRole.ADMIN)
  async updateOne(
    @Param('id') id: string,
    @Body() updateDto: ProductUpdateDto,
  ) {
    return this.productService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @Authorize(UserRole.ADMIN)
  async deleteOne(@Param('id') id: string) {
    return this.productService.delete(id);
  }
}
