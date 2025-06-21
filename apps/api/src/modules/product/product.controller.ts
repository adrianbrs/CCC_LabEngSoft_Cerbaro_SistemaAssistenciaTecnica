import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './models/product.entity';
import { ProductDto } from './dtos/product.dto';
import { ProductUpdateDto } from './dtos/product-update.dto';
import { ProductQueryDto } from './dtos/product-query.dto';
import { Authorize } from '../auth/auth.decorator';
import { UserRole } from '@musat/core';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getAll(@Query() query: ProductQueryDto) {
    return this.productService.getAll(query);
  }

  @Get(':id')
  @Authorize(UserRole.TECHNICIAN)
  async getOne(@Param('id', ParseUUIDPipe) id: string) {
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
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: ProductUpdateDto,
  ) {
    return this.productService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @Authorize(UserRole.ADMIN)
  async deleteOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.delete(id);
  }
}
