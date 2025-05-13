<script setup lang="ts">
import { pt_br } from "@nuxt/ui/locale";
</script>

<template>
  <NuxtLoadingIndicator />
  <UApp :locale="pt_br">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
