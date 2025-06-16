<script setup lang="ts">
import { UButton } from "#components";
import type { IPaginatedEntity, IBrandEntity, IBrandQuery } from "@musat/core";

const props = defineProps<{
  placeholder?: string;
  categoryId?: string | null;
}>();
const model = defineModel<string>();

const query = useApiQuery<IBrandQuery>(() => ({
  categoryId: props.categoryId ?? undefined,
}));

const { data, status } = useApi<IPaginatedEntity<IBrandEntity>>("/brands", {
  key: "brands-select-menu",
  params: query.result,
  lazy: true,
});
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
    icon="i-ci-building-01"
    :placeholder="placeholder ?? 'Selecionar marca'"
    class="w-48"
  >
    <template #trailing>
      <UButton
        v-if="model"
        icon="i-lucide-x"
        aria-label="Limpar seleção de marca"
        color="neutral"
        variant="link"
        class="cursor-pointer"
        @click.stop="model = undefined"
      />
    </template>
  </USelectMenu>
</template>
