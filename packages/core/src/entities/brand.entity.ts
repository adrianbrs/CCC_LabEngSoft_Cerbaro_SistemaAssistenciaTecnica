import { ICoreEntity } from "./core.entity";
import { IPaginatedQuery } from "./paginated.entity";

export interface IBrandEntity extends ICoreEntity {
  name: string;
  email: string;
  phone: string;
}

export interface IBrandQuery extends IPaginatedQuery {
  /**
   * Search term to filter brands by name.
   */
  name?: string;

  /**
   * Filter brands that have products in the specified category.
   */
  categoryId?: string;
}

export interface IBrandPublicResponse
  extends Pick<IBrandEntity, "id" | "name"> {}
