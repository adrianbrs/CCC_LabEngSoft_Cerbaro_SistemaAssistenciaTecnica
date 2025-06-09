<script setup lang="ts">
import { PAGE_HEADER_ACTIONS_ID } from "./PageHeader.vue";
</script>

<template>
  <Teleport :to="`#${PAGE_HEADER_ACTIONS_ID}`" defer>
    <slot />
  </Teleport>
</template>
