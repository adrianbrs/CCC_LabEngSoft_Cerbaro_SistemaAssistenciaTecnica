import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './models/product.entity';
import { ProductDto } from './dtos/product.dto';
import { ProductUpdateDto } from './dtos/product-update.dto';
import { ProductFiltersDto } from './dtos/product-filters.dto';

@Controller('products')
export class ProductController {

    constructor(private readonly productService: ProductService) {}

    @Get()
    async getAll(@Param() filters: ProductFiltersDto){
        return this.productService.getAll(filters);
    }

    @Get(':id')
    async getOne(@Param('id') id: string){
        return Product.findOneOrFail(
            { where: {id} }
        )
    }
     
    @Post()
    async createProduct(@Body() productDto: ProductDto) {

        return this.productService.create(productDto);
    }
    
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateProductDto: ProductUpdateDto,
    ) {
        return this.productService.update(id, updateProductDto);
    }
}
