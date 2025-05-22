<script setup lang="ts">
defineProps<{
  centered?: boolean;
}>();
</script>

<template>
  <div :class="['whitespace-nowrap', { 'text-center': centered }]">
    <h1 class="text-[1.25em] leading-none font-black text-primary mb-1">
      MUSAT
    </h1>
    <p class="text-[0.75em] leading-none text-default/75">
      Assistência Técnica
    </p>
  </div>
</template>
