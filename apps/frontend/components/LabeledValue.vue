<script setup lang="ts">
defineProps<{
  label?: string;
  value?: string;
  icon?: string;
  ui?: {
    icon?: string;
    content?: string;
    label?: string;
    value?: string;
  };
}>();
</script>

<template>
  <div class="flex items-center gap-2 min-w-0">
    <slot name="icon">
      <UIcon
        v-if="icon"
        :name="icon"
        :class="['shrink-0', ui?.icon ?? 'size-7']"
      />
    </slot>
    <div :class="['min-w-0', ui?.content]">
      <slot>
        <slot name="label">
          <h4 v-if="label" :class="['font-semibold', ui?.label]">
            {{ label }}
          </h4>
        </slot>
        <slot name="value">
          <p v-if="value != null" :class="['text-muted truncate', ui?.value]">
            {{ value }}
          </p>
        </slot>
      </slot>
    </div>
  </div>
</template>
