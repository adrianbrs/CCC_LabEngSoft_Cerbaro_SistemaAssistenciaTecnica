<script lang="ts">
import type { ButtonProps } from "@nuxt/ui";

export interface EmptyStateProps {
  icon?: string;
  title?: string;
  description?: string;
  actions?: ButtonProps[];
  ui?: {
    icon?: string;
  };
}
</script>

<script setup lang="ts">
const {
  icon = "i-system-uicons-box-open",
  title = undefined,
  description = undefined,
  actions = undefined,
  ui = undefined,
} = defineProps<EmptyStateProps>();
</script>

<template>
  <div class="space-y-6 w-full">
    <div class="flex items-center justify-center">
      <slot name="asset">
        <UIcon :name="icon" :class="[ui?.icon ?? 'size-10 md:size-12']" />
      </slot>
    </div>
    <div class="space-y-2">
      <slot>
        <slot name="title">
          <h3 v-if="title" class="text-md lg:text-lg font-semibold text-center">
            {{ title }}
          </h3>
        </slot>
        <slot name="description">
          <p
            v-if="description"
            class="text-sm md:text-md text-gray-500 text-center whitespace-pre-line"
          >
            {{ description }}
          </p>
        </slot>
      </slot>
    </div>
    <slot name="actions">
      <div
        v-if="actions?.length"
        class="flex flex-wrap items-center justify-center gap-2"
      >
        <UButton
          v-for="(action, i) in actions"
          :key="`${action.label || action.icon}-${i}`"
          v-bind="action"
          variant="ghost"
          color="primary"
        />
      </div>
    </slot>
  </div>
</template>
