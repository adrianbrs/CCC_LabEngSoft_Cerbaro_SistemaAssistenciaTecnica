import { PartialType } from '@nestjs/swagger';
import { CategoryDto } from './category.dto';

export class CategoryUpdateDto extends PartialType(CategoryDto) {}
