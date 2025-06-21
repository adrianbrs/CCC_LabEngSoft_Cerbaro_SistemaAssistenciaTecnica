<script lang="ts">
import { UserRole } from "@musat/core";
import type { BadgeProps } from "@nuxt/ui";

interface RoleOptions {
  color: BadgeProps["color"];
  label: string;
}

const roleOptions: Partial<Record<UserRole, RoleOptions>> = {
  [UserRole.CLIENT]: {
    color: "primary",
    label: "Cliente",
  },
  [UserRole.TECHNICIAN]: {
    color: "info",
    label: "Técnico",
  },
  [UserRole.ADMIN]: {
    color: "error",
    label: "Admin",
  },
};

export const getRoleLabel = (role: UserRole): string => {
  return roleOptions[role]?.label ?? "Desconhecido";
};
</script>

<script setup lang="ts">
const { role, size = "md" } = defineProps<{
  role: UserRole;
  size?: BadgeProps["size"];
}>();

const options = computed(() => roleOptions[role]);
</script>

<template>
  <UBadge
    v-if="options"
    :size="size"
    variant="soft"
    :color="options.color"
    class="rounded-full"
  >
    {{ options.label }}
  </UBadge>
</template>
