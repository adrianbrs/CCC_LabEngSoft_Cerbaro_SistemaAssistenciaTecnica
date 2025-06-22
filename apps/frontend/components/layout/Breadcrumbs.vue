<script setup lang="ts">
const { breadcrumbs } = useBreadcrumbs();
</script>

<template>
  <div v-if="breadcrumbs.length > 1" class="pt-4 px-4">
    <UBreadcrumb :items="breadcrumbs" />
  </div>
</template>
