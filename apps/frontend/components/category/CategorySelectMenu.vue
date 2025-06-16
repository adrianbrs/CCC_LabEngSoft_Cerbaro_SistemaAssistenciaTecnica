<script setup lang="ts">
import { UButton } from "#components";
import type {
  IPaginatedEntity,
  ICategoryEntity,
  ICategoryQuery,
} from "@musat/core";

defineProps<{
  placeholder?: string;
}>();
const model = defineModel<string>();

const query = useApiQuery<ICategoryQuery>({
  name: "",
});

const { data, status } = useApi<IPaginatedEntity<ICategoryEntity>>(
  "/categories",
  {
    key: "categories-select-menu",
    params: query.result,
    lazy: true,
  }
);
</script>

<template>
  <USelectMenu
    v-model="model"
    v-model:search-term="query.modelDebounce.name"
    :items="data?.items"
    :loading="status === 'pending'"
    value-key="id"
    label-key="name"
    ignore-filter
    icon="i-lucide-tag"
    :placeholder="placeholder ?? 'Selecionar categoria'"
    class="w-48"
  >
    <template #trailing>
      <UButton
        v-if="model"
        icon="i-lucide-x"
        aria-label="Limpar seleção de categoria"
        color="neutral"
        variant="link"
        class="cursor-pointer"
        @click.stop="model = undefined"
      />
    </template>
  </USelectMenu>
</template>
