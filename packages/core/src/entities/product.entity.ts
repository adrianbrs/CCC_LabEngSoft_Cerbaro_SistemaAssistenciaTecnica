import { IBrandEntity, ICategoryEntity, ICoreEntity } from "dist";


export interface IProductEntity extends ICoreEntity{
	category: ICategoryEntity,
	brand: IBrandEntity,
	model: string

}