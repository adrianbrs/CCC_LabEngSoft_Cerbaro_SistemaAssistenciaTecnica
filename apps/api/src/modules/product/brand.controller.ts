import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {Brand} from './models/brand.entity';
import {BrandService} from './brand.service';
import {BrandDto} from './dtos/brand.dto'
import { BrandUpdateDto } from './dtos/brand-update.dto';

export class BrandController{


}