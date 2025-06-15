import { IsUUID, Length } from 'class-validator';
import { Brand } from '../models/brand.entity';
import { Category } from '../models/category.entity';
import { Trim } from '@/shared/transformers';

export class ProductDto {
  @Length(2, 100)
  @Trim()
  model: string;

  @IsUUID('4')
  brandId: Brand['id'];

  @IsUUID('4')
  categoryId: Category['id'];
}
