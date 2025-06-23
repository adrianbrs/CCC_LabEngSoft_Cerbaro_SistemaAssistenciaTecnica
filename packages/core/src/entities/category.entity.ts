import { ICoreEntity } from "./core.entity";
import { IPaginatedQuery } from "./paginated.entity";

export interface ICategoryEntity extends ICoreEntity {
  name: string;
}

export interface ICategoryQuery extends IPaginatedQuery {
  /**
   * Search term to filter categories by name.
   */
  name?: string;

  /**
   * Filter categories that have products from the specified brand.
   */
  brandId?: string;
}
