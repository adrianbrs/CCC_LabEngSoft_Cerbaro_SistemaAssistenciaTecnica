import { PartialType } from '@nestjs/swagger';
import { ProductDto } from './product.dto';

export class ProductUpdateDto extends PartialType(ProductDto) {}
