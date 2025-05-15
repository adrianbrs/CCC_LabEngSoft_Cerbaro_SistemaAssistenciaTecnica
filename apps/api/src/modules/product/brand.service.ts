import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {Brand} from './models/brand.entity';
import { Config } from '@/constants/config';
import { Messages } from '@/constants/messages';
import {BrandDto} from './dtos/brand.dto'
import { BrandUpdateDto } from './dtos/brand-update.dto';

export class BrandService{


}