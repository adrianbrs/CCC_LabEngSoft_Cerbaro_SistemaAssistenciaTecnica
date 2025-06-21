<script setup lang="ts">
import { UserRole } from "@musat/core";
import type { SelectMenuItem } from "@nuxt/ui";

defineProps<{
  placeholder?: string;
}>();

const items: SelectMenuItem[] = Object.values(UserRole);

const model = defineModel<UserRole | undefined>();
</script>

<template>
  <USelectMenu
    v-model="model"
    :items="items"
    icon="i-lucide-shield-user"
    :placeholder="placeholder ?? 'Selecionar cargo'"
    class="w-48 h-8"
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

    <UserRoleBadge v-if="model" :role="model" size="md" />

    <template #item-label="{ item }">
      <UserRoleBadge :role="(item as UserRole)" />
    </template>
  </USelectMenu>
</template>
