<script setup lang="ts">
const props = defineProps<{
  title?: string;
  description?: string;
  ui?: {
    header?: unknown;
    body?: unknown;
  };
}>();

useHead({
  title: props.title,
  meta: [
    ...(props.description
      ? [
          {
            name: "description",
            content: props.description,
          },
        ]
      : []),
  ],
});
</script>

<template>
  <slot name="header">
    <LayoutPageHeader
      v-if="
        title ||
        description ||
        $slots.title ||
        $slots.description ||
        $slots['header-actions']
      "
      :title="title"
      :description="description"
      :class="props.ui?.header"
    >
      <template v-if="$slots.title" #title>
        <slot name="title" />
      </template>

      <template v-if="$slots.description" #description>
        <slot name="description" />
      </template>

      <template #actions>
        <slot name="header-actions" />
      </template>
    </LayoutPageHeader>
  </slot>

  <slot name="content">
    <LayoutBreadcrumbs />

    <div :class="['p-4', props.ui?.body]">
      <slot />
    </div>
  </slot>

  <slot name="footer" />
</template>
