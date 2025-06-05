import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CategoryUpdateDto } from './dtos/category-update.dto';
import { CategoryDto } from './dtos/category.dto';
import { CategoryService } from './category.service';
import { Category } from './models/category.entity';
import { CategoryFiltersDto } from './dtos/category-filters.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async getAll(@Param() filters: CategoryFiltersDto) {
    return this.categoryService.getAll(filters);
  }

  @Get(':id')
  async getCategoryById(@Param('id') id: string) {
    return this.categoryService.getCategoryById(id);
  }

  @Post()
  async create(@Body() categoryDto: CategoryDto) {
    return this.categoryService.create(categoryDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: CategoryUpdateDto,
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    return this.categoryService.delete(id);
  }
}
