import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';
import {CategoryDto} from './category.dto';

export class CategoryUpdateDto extends PartialType(CategoryDto) {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  @ApiProperty({ example: 'Electronics' })
  name?: string;
}