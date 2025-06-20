import type {
  ICoreEntity,
  IPaginatedEntity,
  IPaginatedQuery,
} from "@musat/core";
import type { PaginationProps as UPaginationProps } from "@nuxt/ui";

export type UseApiPaginationProps = UPaginationProps & {
  "onUpdate:page": (page: number) => void;
};

export interface UseApiPaginationReturn {
  props: ComputedRef<UseApiPaginationProps>;
}

export const useApiPagination = <
  TEntity extends ICoreEntity,
  TQuery extends IPaginatedQuery
>(
  query: UseSearchQueryReturn<TQuery>,
  data: MaybeRefOrGetter<IPaginatedEntity<TEntity> | undefined | null>
): UseApiPaginationReturn => {
  watch(
    query.initialQuery,
    (newInitialQuery) => {
      if (
        typeof newInitialQuery.page !== "number" ||
        typeof newInitialQuery.limit !== "number"
      ) {
        query.initialQuery.page = 1;
        query.initialQuery.limit = 10;
      }
    },
    { immediate: true, flush: "pre" }
  );

  watch(
    () => Object.assign({}, toRaw(toValue(query.model))),
    (newQuery, oldQuery) => {
      if (
        newQuery.page === oldQuery?.page &&
        newQuery.limit === oldQuery?.limit
      ) {
        query.model.page = 1;
      }
    },
    {
      immediate: true,
      deep: true,
    }
  );

  const props = computed<UseApiPaginationProps>(() => {
    const _data = toValue(data);

    return {
      page: _data?.page ?? query.model.page,
      itemsPerPage: _data?.limit ?? query.model.limit,
      total: _data?.totalItems ?? 0,
      "onUpdate:page": (page: number) => {
        query.model.page = page;
      },
    };
  });

  return {
    props,
  };
};
