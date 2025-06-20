<script setup lang="ts">
import type { IBrandEntity } from "@musat/core";
import type { FormSubmitEvent } from "@nuxt/ui";
import { FetchError } from "ofetch";
import { BrandSchema, type BrandFormData } from "~/utils/schema/brand.schema";
import * as _ from "lodash-es";

const open = defineModel<boolean>("open");

const props = defineProps<{
  brand?: IBrandEntity;
}>();

const emit = defineEmits<{
  success: [category: IBrandEntity, isNew: boolean];
  error: [error?: Error | FetchError];
}>();

const form = useTemplateRef("form");
const toast = useToast();
const state = reactive<BrandFormData>({
  name: props.brand?.name ?? "",
  email: props.brand?.email ?? "",
  phone: props.brand?.phone ?? "",
});
const api = useApi();
const loading = ref(false);
const error = ref<Error | FetchError | undefined>();

const onSubmit = async ({ data }: FormSubmitEvent<BrandFormData>) => {
  const body = _.cloneDeep(toRaw(data));

  try {
    loading.value = true;
    error.value = undefined;
    let res: IBrandEntity;

    if (props.brand) {
      res = await api<IBrandEntity>(uri`/brands/${props.brand.id}`, {
        method: "PATCH",
        body,
      });
    } else {
      res = await api<IBrandEntity>("/brands", {
        method: "POST",
        body,
      });
    }

    emit("success", res, !props.brand);
    open.value = false;

    toast.add({
      description: props.brand
        ? `Marca "${res.name}" atualizada!`
        : `Marca "${res.name}" criada!`,
      color: "success",
      icon: "i-lucide-circle-check",
    });
  } catch (err: unknown) {
    emit("error", err as FetchError | Error);

    if (
      err instanceof FetchError &&
      err.response?._data?.code === "DUPLICATE_BRAND"
    ) {
      form.value?.setErrors(
        [
          {
            name: "name",
            message: "Já existe uma marca com esse nome.",
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
    :title="brand ? 'Editar Marca' : 'Nova Marca'"
    :aria-label="brand ? `Editar marca ${brand.name}` : 'Criar nova marca'"
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
        :schema="BrandSchema"
        :validate-on="['input', 'change']"
        :disabled="loading"
        :attach="false"
        transform
        @submit="onSubmit"
      >
        <div class="space-y-4">
          <UFormField name="name" label="Nome" required>
            <UInput
              v-model="state.name"
              :placeholder="brand ? brand.name : 'Digite o nome da nova marca'"
              class="w-full"
            />
          </UFormField>

          <UFormField name="email" label="E-mail" required>
            <UInput
              v-model="state.email"
              type="email"
              :placeholder="brand ? brand.email : 'Digite um e-mail de contato'"
              class="w-full"
            />
          </UFormField>

          <UFormField name="phone" label="Telefone" required>
            <UInput
              v-model="state.phone"
              v-maska
              type="tel"
              :placeholder="
                brand ? brand.phone : 'Digite um telefone de contato'
              "
              class="w-full"
              data-maska="['(##) # ####-####', '(##) ####-####']"
            />
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
