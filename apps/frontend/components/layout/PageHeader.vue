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
    class="flex items-center gap-4 sticky top-(--ui-header-height) bg-default/75 backdrop-blur -mx-4 px-4 h-14 md:mx-0"
  >
    <UButton
      v-if="prevRoute"
      variant="ghost"
      size="md"
      icon="i-lucide-arrow-left"
      :to="prevRoute"
    >
      Voltar
    </UButton>

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

      <div v-if="$slots.actions" class="flex items-center gap-2">
        <slot name="actions" />
      </div>
    </slot>
  </header>
</template>
