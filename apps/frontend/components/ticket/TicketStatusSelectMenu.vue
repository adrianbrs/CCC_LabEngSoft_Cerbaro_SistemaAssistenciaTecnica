<script setup lang="ts">
import { TicketStatus } from "@musat/core";
import type { SelectMenuItem } from "@nuxt/ui";

defineProps<{
  placeholder?: string;
}>();

const items: SelectMenuItem[] = Object.values(TicketStatus);

const model = defineModel<TicketStatus | undefined>();
</script>

<template>
  <USelectMenu
    v-model="model"
    :items="items"
    icon="i-lucide-file-check-2"
    :placeholder="placeholder ?? 'Selecionar status'"
    class="min-w-54 h-8"
  >
    <template #trailing>
      <UButton
        v-if="model"
        icon="i-lucide-x"
        aria-label="Limpar seleção"
        color="neutral"
        variant="link"
        class="cursor-pointer"
        @click.stop="model = undefined"
      />
    </template>

    <TicketStatusBadge v-if="model" :status="model" size="md" />

    <template #item-label="{ item }">
      <TicketStatusBadge :status="(item as TicketStatus)" />
    </template>
  </USelectMenu>
</template>
