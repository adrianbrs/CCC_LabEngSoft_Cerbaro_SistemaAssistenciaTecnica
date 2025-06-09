<script setup lang="ts">
defineProps<{
  title?: string;
  description?: string;
}>();
</script>

<template>
  <section>
    <slot name="header">
      <LayoutPageHeader
        v-if="title"
        :title="title"
        :description="description"
      />
    </slot>

    <slot name="content">
      <LayoutBreadcrumbs />

      <div class="p-4 sm:p-6 lg:p-8">
        <slot />
      </div>
    </slot>

    <slot name="footer" />
  </section>
</template>
