<script setup lang="ts">
import type {
  IPaginatedEntity,
  IProductEntity,
  IProductQuery,
} from "@musat/core";

const props = defineProps<{
  placeholder?: string;
  categoryId?: string | null;
  brandId?: string | null;
}>();
const model = defineModel<string>();

const { data, status, query } = useApiQuery<
  IPaginatedEntity<IProductEntity>,
  IProductQuery
>("/products", {
  lazy: true,
  query: () => ({
    categoryId: props.categoryId ?? undefined,
    brandId: props.brandId ?? undefined,
  }),
});
</script>

<template>
  <USelectMenu
    v-model="model"
    v-model:search-term="query.modelDebounce.model"
    :items="data?.items"
    :loading="status === 'pending'"
    value-key="id"
    label-key="model"
    ignore-filter
    icon="i-ci-building-01"
    :placeholder="placeholder ?? 'Selecionar produto'"
    class="w-48"
  >
    <template #trailing>
      <UButton
        v-if="model"
        icon="i-lucide-x"
        aria-label="Limpar seleção de produto"
        color="neutral"
        variant="link"
        class="cursor-pointer"
        @click.stop="model = undefined"
      />
    </template>
  </USelectMenu>
</template>
