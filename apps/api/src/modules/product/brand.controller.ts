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
import { BrandService } from './brand.service';
import { BrandDto } from './dtos/brand.dto';
import { BrandUpdateDto } from './dtos/brand-update.dto';
import { UserRole } from '@musat/core';
import { Authorize } from '../auth/auth.decorator';
import { BrandFiltersDto } from './dtos/brand-filters.dto';

@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  async getAll(@Query() filters: BrandFiltersDto) {
    return this.brandService.getAll(filters);
  }

  @Get('/:id')
  @Authorize(UserRole.TECHNICIAN)
  async getOne(@Param('id') id: string) {
    return this.brandService.getById(id);
  }

  @Post()
  @Authorize(UserRole.ADMIN)
  async create(@Body() brandDto: BrandDto) {
    return this.brandService.create(brandDto);
  }

  @Patch('/:id')
  @Authorize(UserRole.ADMIN)
  async update(@Body() brandDto: BrandUpdateDto, @Param('id') id: string) {
    return this.brandService.update(id, brandDto);
  }

  @Delete('/id')
  @Authorize(UserRole.ADMIN)
  @HttpCode(204)
  async delete(@Param('id') id: string) {
    return this.brandService.delete(id);
  }
}
