<script setup lang="ts">
const { user } = useUserSession(true);

definePageMeta({
  nav: {
    label: "Início",
    icon: "i-lucide-home",
  },
});
</script>

<template>
  <LayoutPage>
    <h1>Hello, {{ user.name }}!</h1>
  </LayoutPage>
</template>
