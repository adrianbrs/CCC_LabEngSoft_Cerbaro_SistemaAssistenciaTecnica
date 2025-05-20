import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Brand } from './models/brand.entity';
import { BrandService } from './brand.service';
import { BrandDto } from './dtos/brand.dto'
import { BrandUpdateDto } from './dtos/brand-update.dto';
import { UserRole } from '@musat/core';
import { Authorize } from '../auth/auth.decorator';

@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) { }

  @Get()
  @Authorize(UserRole.ADMIN)
  async getAll() {
    return Brand.find();
  }

  @Get(':name')
  @Authorize(UserRole.ADMIN)
  async getBrandByName(@Param('name') name: string) {
    return this.brandService.getBrandByName(name);
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