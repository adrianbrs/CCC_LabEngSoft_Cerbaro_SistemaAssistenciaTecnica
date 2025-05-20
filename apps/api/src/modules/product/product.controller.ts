import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './models/product.entity';
import { ProductDto } from './dtos/product.dto';

@Controller('products')
export class ProductController {

    constructor(private readonly productService: ProductService) {}

    @Get()
    async getAll(){
        return Product.find();
    }
     
    @Post()
    async createCategory(@Body() productDto: ProductDto) {
        return this.productService.create(productDto);
      }
    
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateProductDto: ProductDto,
    ) {
        return this.productService.update(id, updateProductDto);
    }
}
