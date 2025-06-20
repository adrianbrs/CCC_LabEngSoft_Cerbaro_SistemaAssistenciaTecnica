<script
  setup
  lang="ts"
  generic="TContext extends UseApiQueryReturn = UseApiQueryReturn"
>
const props = defineProps<{
  context?: TContext;
}>();

const context = useApiQueryCtx<TContext>(props.context);
const { status, refresh } = context;
</script>

<template>
  <div class="flex items-center mb-2 gap-4">
    <slot name="header" v-bind="context" />

    <UButton
      variant="soft"
      color="neutral"
      icon="i-lucide-refresh-ccw"
      class="cursor-pointer justify-self-end"
      :loading="status === 'pending'"
      @click="refresh()"
    >
      Atualizar
    </UButton>
  </div>

  <slot v-bind="context" />
</template>
