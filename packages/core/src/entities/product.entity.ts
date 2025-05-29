import { ICoreEntity } from "./core.entity";
import { IBrandEntity } from "./brand.entity";
import { ICategoryEntity } from "./category.entity";


export interface IProductEntity extends ICoreEntity{
	category: ICategoryEntity,
	brand: IBrandEntity,
	model: string

}