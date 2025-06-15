import { PartialType } from '@nestjs/swagger';
import { BrandDto } from './brand.dto';

export class BrandUpdateDto extends PartialType(BrandDto) {}
