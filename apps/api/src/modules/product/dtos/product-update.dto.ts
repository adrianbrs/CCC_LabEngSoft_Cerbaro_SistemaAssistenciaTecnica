import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsOptional, IsString, Length, ValidateNested } from "class-validator";
import { BrandUpdateDto } from "./brand-update.dto";
import { Type } from "class-transformer";
import { CategoryUpdateDto } from "./category-update.dto";
import { ProductDto } from "./product.dto";
import { Category } from "../models/category.entity";
import { Brand } from "../models/brand.entity";

export class ProductUpdateDto extends PartialType(ProductDto) {
  @IsOptional()
  @Type(() => Category)
  @ApiProperty({ type: () => Category })
  category?: Category;

  @IsOptional()
  @Type(() => Brand)
  @ApiProperty({ type: () => Brand })
  brand?: Brand;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  @ApiProperty({ example: 'Model X' })
  model?: string;
}