<script setup lang="ts">
import { UserRole } from "@musat/core";

const { hasRole } = useUserSession(true);
const isAdmin = computed(() => hasRole(UserRole.ADMIN));

useBreadcrumbs(() => [
  {
    label: isAdmin.value ? "Solicitações" : "Solicitações assignadas",
    to: "/tickets",
  },
]);
</script>

<template>
  <NuxtPage />
</template>
