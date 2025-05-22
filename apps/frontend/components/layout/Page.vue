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
      <div class="md:pl-4 py-4">
        <slot />
      </div>
    </slot>

    <slot name="footer" />
  </section>
</template>
