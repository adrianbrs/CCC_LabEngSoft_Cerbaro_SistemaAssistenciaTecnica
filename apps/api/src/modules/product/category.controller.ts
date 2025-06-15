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
import { CategoryUpdateDto } from './dtos/category-update.dto';
import { CategoryDto } from './dtos/category.dto';
import { CategoryService } from './category.service';
import { CategoryQueryDto } from './dtos/category-query.dto';
import { Authorize } from '../auth/auth.decorator';
import { UserRole } from '@musat/core';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async getAll(@Query() query: CategoryQueryDto) {
    return this.categoryService.getAll(query);
  }

  @Get(':id')
  @Authorize(UserRole.TECHNICIAN)
  async getOne(@Param('id') id: string) {
    return this.categoryService.getById(id);
  }

  @Post()
  @Authorize(UserRole.ADMIN)
  async create(@Body() categoryDto: CategoryDto) {
    return this.categoryService.create(categoryDto);
  }

  @Patch(':id')
  @Authorize(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: CategoryUpdateDto,
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @Authorize(UserRole.ADMIN)
  @HttpCode(204)
  async deleteCategory(@Param('id') id: string) {
    return this.categoryService.delete(id);
  }
}
