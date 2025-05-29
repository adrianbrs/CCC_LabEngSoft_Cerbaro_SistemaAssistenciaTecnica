import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
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
  async getAll(@Param() filters: BrandFiltersDto) {
    return this.brandService.getAll(filters);
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
}
