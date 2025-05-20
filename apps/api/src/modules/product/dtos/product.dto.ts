import { IsNotEmpty, Length, ValidateNested } from "class-validator";
import { BrandDto } from "./brand.dto";
import { Type } from "class-transformer";
import { CategoryDto } from "./category.dto";

export class ProductDto{
	@Length(2,100)
	model: string;

	@IsNotEmpty()
	@ValidateNested()
	@Type(()=>BrandDto)
	brand: BrandDto;

	@IsNotEmpty()
	@ValidateNested()
	@Type(()=>CategoryDto)
	category: CategoryDto;
}