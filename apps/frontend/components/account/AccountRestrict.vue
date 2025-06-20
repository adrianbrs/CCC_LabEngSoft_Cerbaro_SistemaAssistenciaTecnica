<script setup lang="ts">
import type { UserRole } from "@musat/core";

defineProps<{
  role: UserRole | UserRole[];
}>();

const { hasRole } = useUserSession(true);
</script>

<template>
  <slot v-if="hasRole(role)" />
</template>
