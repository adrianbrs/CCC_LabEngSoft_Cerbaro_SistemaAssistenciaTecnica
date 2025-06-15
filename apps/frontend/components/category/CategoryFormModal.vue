<script setup lang="ts">
import type { ICategoryEntity, ICoreEntity } from "@musat/core";
import type { FormSubmitEvent } from "@nuxt/ui";
import {
  CategorySchema,
  type CategoryFormData,
} from "~/utils/schema/category.schema";
import { FetchError } from "ofetch";

const open = defineModel<boolean>("open");

const props = defineProps<{
  category?: ICategoryEntity;
}>();

const emit = defineEmits<{
  success: [category: ICategoryEntity, isNew: boolean];
  error: [error?: Error | FetchError];
}>();

const form = useTemplateRef("form");
const toast = useToast();
const isEditing = computed(() => !!props.category);
const state = reactive<Omit<ICategoryEntity, keyof ICoreEntity>>({
  name: props.category?.name ?? "",
});
const { $api } = useNuxtApp();
const loading = ref(false);
const error = ref<Error | FetchError | undefined>();

const onSubmit = async ({ data }: FormSubmitEvent<CategoryFormData>) => {
  try {
    loading.value = true;
    error.value = undefined;
    let res: ICategoryEntity;

    if (props.category) {
      res = await $api<ICategoryEntity>(uri`/categories/${props.category.id}`, {
        method: "PATCH",
        body: data,
      });
    } else {
      res = await $api<ICategoryEntity>("/categories", {
        method: "POST",
        body: data,
      });
    }

    emit("success", res, !isEditing.value);
    open.value = false;

    toast.add({
      description: isEditing.value
        ? `Categoria "${res.name}" atualizada!`
        : `Categoria "${res.name}" criada!`,
      color: "success",
      icon: "i-lucide-circle-check",
    });
  } catch (err: unknown) {
    emit("error", err as FetchError | Error);

    if (
      err instanceof FetchError &&
      err.response?._data?.code === "DUPLICATE_CATEGORY"
    ) {
      form.value?.setErrors(
        [
          {
            name: "name",
            message: "Já existe uma categoria com esse nome.",
          },
        ],
        "name"
      );
    } else {
      error.value = err as Error | FetchError;
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <UModal
    v-model:open="open"
    :title="isEditing ? 'Editar Categoria' : 'Nova Categoria'"
    :aria-label="
      isEditing ? `Editar categoria ${category?.name}` : 'Criar nova categoria'
    "
    :dismissible="false"
    :close="false"
    :ui="{
      footer: 'justify-end',
    }"
  >
    <template #body>
      <UForm
        id="category-form"
        ref="form"
        :state="state"
        :schema="CategorySchema"
        :validate-on="['input', 'change']"
        :disabled="loading"
        :attach="false"
        transform
        @submit="onSubmit"
      >
        <UFormField name="name" label="Nome" required>
          <UInput
            v-model="state.name"
            :placeholder="
              isEditing ? category?.name : 'Digite o nome da nova categoria'
            "
            class="w-full"
          />
        </UFormField>

        <UAlert
          v-if="error"
          color="error"
          variant="solid"
          title="Oops! Ocorreu um erro"
          description="Não foi possível salvar as alterações, tente novamente mais tarde."
          class="mt-4"
          :actions="[
            {
              label: 'Tentar novamente',
              icon: 'i-lucide-refresh-ccw',
              variant: 'soft',
              color: 'neutral',
              type: 'submit',
            },
          ]"
        />
      </UForm>
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
        color="primary"
        class="cursor-pointer"
        :loading="loading"
        type="submit"
        form="category-form"
      >
        Salvar
      </UButton>
    </template>
  </UModal>
</template>
