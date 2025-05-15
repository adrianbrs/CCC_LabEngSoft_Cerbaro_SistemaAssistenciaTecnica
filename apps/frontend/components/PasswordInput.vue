<script setup lang="ts">
const show = defineModel<boolean>("show", {
  default: false,
});

const input = useTemplateRef("input");

defineExpose({
  inputRef: computed(() => input.value?.inputRef),
});
</script>

<template>
  <UInput
    ref="input"
    :type="show ? 'text' : 'password'"
    :ui="{ trailing: 'pe-1' }"
  >
    <template #trailing>
      <UButton
        color="neutral"
        variant="link"
        size="sm"
        class="cursor-pointer"
        :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
        :aria-label="show ? 'Ocultar senha' : 'Mostrar senha'"
        :aria-pressed="show"
        aria-controls="password"
        @click="show = !show"
      />
    </template>
  </UInput>
</template>
