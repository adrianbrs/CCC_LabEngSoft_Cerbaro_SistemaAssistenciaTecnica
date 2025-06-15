import { Trim } from '@/shared/transformers';
import { Length } from 'class-validator';

export class CategoryDto {
  @Length(2, 100)
  @Trim()
  name: string;
}
