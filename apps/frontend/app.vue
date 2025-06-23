<script setup lang="ts">
import { pt_br } from "@nuxt/ui/locale";
</script>

<template>
  <UApp :locale="pt_br">
    <NuxtLoadingIndicator :throttle="0" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
