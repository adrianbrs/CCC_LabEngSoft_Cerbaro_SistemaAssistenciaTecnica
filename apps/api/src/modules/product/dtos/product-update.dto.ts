import { PartialType } from "@nestjs/swagger";
import { IsOptional, ValidateNested } from "class-validator";
import { BrandUpdateDto } from "./brand-update.dto";
import { Type } from "class-transformer";
import { CategoryUpdateDto } from "./category-update.dto";
import { ProductDto } from "./product.dto";

export class ProductUpdateDto extends PartialType(ProductDto){}