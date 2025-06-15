export interface IPaginatedOptions<T = unknown> {
  items: T[];
  page: number;
  limit: number;
  totalItems: number;
}

export interface IPaginatedEntity<T = unknown> {
  readonly items: T[];
  readonly page: number;
  readonly limit: number;
  readonly totalItems: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPrevPage: boolean;
}

export interface IPaginatedQuery {
  /**
   * The page number to retrieve.
   */
  page?: number;

  /**
   * The number of items per page.
   */
  limit?: number;
}
