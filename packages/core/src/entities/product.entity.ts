import { ICoreEntity } from "./core.entity";
import { IBrandEntity } from "./brand.entity";
import { ICategoryEntity } from "./category.entity";
import { IPaginatedQuery } from "./paginated.entity";

export interface IProductEntity extends ICoreEntity {
  category: ICategoryEntity;
  brand: IBrandEntity;
  model: string;
}

export interface IProductQuery extends IPaginatedQuery {
  /**
   * Search term to filter product by model.
   */
  model?: string;

  /**
   * Filter products by category.
   */
  categoryId?: string;

  /**
   * Filter products by brand.
   */
  brandId?: string;
}
