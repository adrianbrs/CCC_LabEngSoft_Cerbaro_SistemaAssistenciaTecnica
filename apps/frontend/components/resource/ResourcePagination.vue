<script
  setup
  lang="ts"
  generic="TContext extends UseApiQueryReturn<IPaginatedEntity<ICoreEntity>, IPaginatedQuery>"
>
import type {
  ICoreEntity,
  IPaginatedEntity,
  IPaginatedQuery,
} from "@musat/core";

const props = defineProps<{
  context?: TContext;
}>();

const context = useApiQueryCtx<TContext>(props.context);
const { query, data } = context;
const { props: paginationProps } = useApiPagination(query, data);
</script>

<template>
  <div class="flex justify-center border-t border-default pt-4">
    <UPagination v-bind="paginationProps" />
  </div>
</template>
