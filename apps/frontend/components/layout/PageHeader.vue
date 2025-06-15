<script lang="ts">
export const PAGE_HEADER_ACTIONS_ID = "layout-page-header-actions" as const;
</script>

<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
}>();

const route = useRoute();

const prevRoute = computed(() => {
  const parent = route.matched.at(-2);
  if (parent && parent.path !== route.path) {
    return parent.path;
  }

  if (route.path !== "/") {
    return "/";
  }

  return null;
});
</script>

<template>
  <header
    class="sticky top-(--ui-header-height) bg-default/75 backdrop-blur h-14 z-80 px-4"
  >
    <div class="flex items-center gap-4 border-b border-default h-full">
      <UButton
        v-if="prevRoute"
        variant="link"
        size="md"
        icon="i-lucide-arrow-left"
        :to="prevRoute"
        aria-label="Voltar"
      />

      <slot>
        <div class="flex flex-col flex-1 min-w-0">
          <slot name="title">
            <h1 class="text-lg md:text-xl font-semibold truncate">
              {{ title }}
            </h1>
          </slot>
          <slot name="description">
            <p v-if="description" class="text-xs text-dimmed truncate">
              {{ description }}
            </p>
          </slot>
        </div>

        <div :id="PAGE_HEADER_ACTIONS_ID" class="flex items-center gap-2">
          <slot name="actions" />
        </div>
      </slot>
    </div>
  </header>
</template>
