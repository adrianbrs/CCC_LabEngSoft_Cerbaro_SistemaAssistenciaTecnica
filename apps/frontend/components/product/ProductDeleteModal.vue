<script setup lang="ts">
import type { IProductEntity } from "@musat/core";

const props = defineProps<{
  product: IProductEntity;
}>();

const open = defineModel<boolean>("open");

const emit = defineEmits<{
  success: [product: IProductEntity];
  error: [error?: Error];
}>();

const toast = useToast();

const { execute, error, status, refresh } = useApi(
  computed(() => `/products/${props.product.id}`),
  {
    method: "DELETE",
    immediate: false,
    onResponse({ response }) {
      if (response.status < 200 || response.status >= 300) {
        return;
      }

      emit("success", props.product);
      open.value = false;

      toast.add({
        description: `Produto "${props.product.model}" (${
          props.product.brand?.name ?? "Desconhecida"
        }) excluído!`,
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
    title="Excluir Produto"
    :aria-label="`Excluir produto ${product.model}`"
    :dismissible="false"
    :close="false"
    :ui="{
      footer: 'justify-end',
    }"
  >
    <template #body>
      <p class="text-error mb-4">
        Tem certeza de que deseja excluir o produto
        <strong>{{ product.model }}</strong> da marca
        <strong>{{ product.brand?.name ?? "Desconhecida" }}</strong
        >?
      </p>

      <UAlert
        description="Esta ação não pode ser desfeita."
        color="error"
        variant="subtle"
      />

      <UAlert
        v-if="error"
        color="error"
        variant="solid"
        title="Oops! Ocorreu um erro"
        description="Não foi possível remover o produto, tente novamente mais tarde."
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
