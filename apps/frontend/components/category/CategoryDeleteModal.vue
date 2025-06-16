<script setup lang="ts">
import type { ICategoryEntity } from "@musat/core";

const props = defineProps<{
  category: ICategoryEntity;
}>();

const open = defineModel<boolean>("open");

const emit = defineEmits<{
  success: [category: ICategoryEntity];
  error: [error?: Error];
}>();

const toast = useToast();

const { execute, error, status, refresh } = useApi(
  computed(() => `/categories/${props.category.id}`),
  {
    method: "DELETE",
    immediate: false,
    onResponse({ response }) {
      if (response.status < 200 || response.status >= 300) {
        return;
      }

      emit("success", props.category);
      open.value = false;

      toast.add({
        description: `Categoria "${props.category.name}" excluída!`,
        color: "success",
        icon: "i-lucide-circle-check",
      });
    },
    onResponseError({ error }) {
      emit("error", error);
    },
  }
);

const loading = computed(() => status.value === "pending");
</script>

<template>
  <UModal
    v-model:open="open"
    title="Excluir Categoria"
    :aria-label="`Excluir categoria ${category.name}`"
    :dismissible="false"
    :close="false"
    :ui="{
      footer: 'justify-end',
    }"
  >
    <template #body>
      <p class="text-error mb-4">
        Tem certeza de que deseja excluir a categoria
        <strong>{{ category.name }}</strong
        >?
      </p>

      <UAlert
        description="Esta ação não pode ser desfeita e todos os produtos associados a esta categoria serão afetados."
        color="error"
        variant="subtle"
      />

      <UAlert
        v-if="error?.data?.code === 'COLLECTION_NOT_EMPTY'"
        color="error"
        variant="solid"
        title="Não foi possível remover a categoria"
        description="A categoria possui produtos associados e não pode ser removida. Por favor, remova os produtos associados antes de tentar novamente."
        icon="i-lucide-alert-triangle"
        class="mt-4"
      />

      <UAlert
        v-else-if="error"
        color="error"
        variant="solid"
        title="Oops! Ocorreu um erro"
        description="Não foi possível remover a categoria, tente novamente mais tarde."
        icon="i-lucide-alert-triangle"
        class="mt-4"
        :actions="[
          {
            label: 'Tentar novamente',
            icon: 'i-lucide-refresh-ccw',
            variant: 'soft',
            color: 'neutral',
            onClick: () => refresh(),
          },
        ]"
      />
    </template>

    <template #footer>
      <UButton
        variant="ghost"
        color="neutral"
        class="cursor-pointer"
        :disabled="loading"
        @click="open = false"
      >
        Cancelar
      </UButton>
      <UButton
        color="error"
        class="cursor-pointer"
        :loading="loading"
        @click="() => execute()"
      >
        Excluir
      </UButton>
    </template>
  </UModal>
</template>
