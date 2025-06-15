import type { IPaginatedEntity, IPaginatedQuery } from "@musat/core";
import type { PaginationProps as UPaginationProps } from "@nuxt/ui";
import type { Reactive } from "vue";

type PaginationProps = UPaginationProps & {
  "onUpdate:page": (page: number) => void;
};

export interface UseApiPaginationReturn {
  props: ComputedRef<PaginationProps>;
}

export const useApiPagination = (
  query: Reactive<IPaginatedQuery>,
  data: MaybeRefOrGetter<IPaginatedEntity | undefined | null>
): UseApiPaginationReturn => {
  watch(
    () => Object.assign({}, toValue(query)),
    (newQuery, oldQuery) => {
      if (
        newQuery.page === oldQuery?.page &&
        newQuery.limit === oldQuery?.limit
      ) {
        query.page = 1;
      }
    },
    {
      immediate: true,
      deep: true,
    }
  );

  const props = computed<PaginationProps>(() => {
    const _data = toValue(data);

    return {
      page: _data?.page ?? query.page,
      itemsPerPage: _data?.limit ?? query.limit,
      total: _data?.totalItems ?? 0,
      "onUpdate:page": (page: number) => {
        query.page = page;
      },
    };
  });

  return {
    props,
  };
};
