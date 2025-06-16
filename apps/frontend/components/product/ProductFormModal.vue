<script setup lang="ts">
import type { IProductEntity } from "@musat/core";
import type { FormSubmitEvent } from "@nuxt/ui";
import { FetchError } from "ofetch";
import * as _ from "lodash-es";
import {
  ProductSchema,
  type ProductFormData,
} from "~/utils/schema/product.schema";

const open = defineModel<boolean>("open");

const props = defineProps<{
  product?: IProductEntity;
}>();

const emit = defineEmits<{
  success: [product: IProductEntity, isNew: boolean];
  error: [error?: Error | FetchError];
}>();

const form = useTemplateRef("form");
const toast = useToast();
const state = reactive<ProductFormData>({
  model: props.product?.model ?? "",
  brandId: props.product?.brand?.id ?? "",
  categoryId: props.product?.category?.id ?? "",
});
const { $api } = useNuxtApp();
const loading = ref(false);
const error = ref<Error | FetchError | undefined>();

const onSubmit = async ({ data }: FormSubmitEvent<ProductFormData>) => {
  const body = _.cloneDeep(toRaw(data));

  try {
    loading.value = true;
    error.value = undefined;
    let res: IProductEntity;

    if (props.product) {
      res = await $api<IProductEntity>(uri`/products/${props.product.id}`, {
        method: "PATCH",
        body,
      });
    } else {
      res = await $api<IProductEntity>("/products", {
        method: "POST",
        body,
      });
    }

    emit("success", res, !props.product);
    open.value = false;

    toast.add({
      description: props.product
        ? `Produto "${res.model}" (${
            res.brand?.name ?? "Desconhecida"
          }) atualizada!`
        : `Produto "${res.model}" (${
            res.brand?.name ?? "Desconhecida"
          }) criada!`,
      color: "success",
      icon: "i-lucide-circle-check",
    });
  } catch (err: unknown) {
    emit("error", err as FetchError | Error);

    if (
      err instanceof FetchError &&
      err.response?._data?.code === "DUPLICATE_PRODUCT"
    ) {
      form.value?.setErrors(
        [
          {
            name: "model",
            message: "Já existe um produto desta marca com esse modelo.",
          },
        ],
        "model"
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
    :title="product ? 'Editar Produto' : 'Novo Produto'"
    :aria-label="
      product
        ? `Editar produto ${product.model} da marca ${
            product.brand?.name ?? 'Desconhecida'
          }`
        : 'Criar novo produto'
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
        :schema="ProductSchema"
        :validate-on="['input', 'change']"
        :disabled="loading"
        :attach="false"
        transform
        @submit="onSubmit"
      >
        <div class="space-y-4">
          <UFormField name="model" label="Modelo" required>
            <UInput
              v-model="state.model"
              :placeholder="
                product ? product.model : 'Digite o nome do modelo do produto'
              "
              class="w-full"
            />
          </UFormField>

          <UFormField name="brandId" label="Marca" required>
            <BrandSelectMenu v-model="state.brandId" class="w-full" />
          </UFormField>

          <UFormField name="categoryId" label="Categoria" required>
            <CategorySelectMenu v-model="state.categoryId" class="w-full" />
          </UFormField>
        </div>

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
