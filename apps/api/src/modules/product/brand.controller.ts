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
import { BrandService } from './brand.service';
import { BrandDto } from './dtos/brand.dto';
import { BrandUpdateDto } from './dtos/brand-update.dto';
import { UserRole } from '@musat/core';
import { Authorize } from '../auth/auth.decorator';
import { BrandQueryDto } from './dtos/brand-query.dto';

@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  async getAll(@Query() query: BrandQueryDto) {
    return this.brandService.getAll(query);
  }

  @Get('/:id')
  @Authorize(UserRole.TECHNICIAN)
  async getOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.brandService.getById(id);
  }

  @Post()
  @Authorize(UserRole.ADMIN)
  async create(@Body() brandDto: BrandDto) {
    return this.brandService.create(brandDto);
  }

  @Patch('/:id')
  @Authorize(UserRole.ADMIN)
  async update(
    @Body() brandDto: BrandUpdateDto,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.brandService.update(id, brandDto);
  }

  @Delete('/:id')
  @Authorize(UserRole.ADMIN)
  @HttpCode(204)
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.brandService.delete(id);
  }
}
