<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import type { FetchError } from "ofetch";
import * as _ from "lodash-es";
import type { ITicketEntity } from "@musat/core";
import {
  TicketCreateSchema,
  type TicketCreateFormData,
} from "~/utils/schema/ticket.schema";

const open = defineModel<boolean>("open");

const emit = defineEmits<{
  success: [ticket: ITicketEntity];
  error: [error?: Error | FetchError];
}>();

const form = useTemplateRef("form");
const toast = useToast();
const state = reactive<TicketCreateFormData>({
  productId: "",
  description: "",
  serialNumber: "",
});
const api = useApi();
const loading = ref(false);
const error = ref<Error | FetchError | undefined>();
const category = ref<string | undefined>(undefined);
const brand = ref<string | undefined>(undefined);
const cancelModal = ref(false);

const onSubmit = async ({ data }: FormSubmitEvent<TicketCreateFormData>) => {
  const body = _.cloneDeep(toRaw(data));

  try {
    loading.value = true;
    error.value = undefined;

    const res = await api<ITicketEntity>("/tickets", {
      method: "POST",
      body,
    });

    emit("success", res);
    open.value = false;

    toast.add({
      title: "Assistência solicitada",
      description:
        "Recebemos a sua solicitação. Em breve, um de nossos técnicos prosseguirá com o atendimento.",
      color: "success",
      icon: "i-lucide-circle-check",
      duration: 10000,
    });
  } catch (err: unknown) {
    emit("error", err as FetchError | Error);
    error.value = err as Error | FetchError;
  } finally {
    loading.value = false;
  }
};

const onCancel = () => {
  open.value = false;
  cancelModal.value = false;
};
</script>

<template>
  <USlideover
    v-model:open="open"
    title="Solicitar assistência técnica"
    description="Solicite assistência técnica para um produto com defeito"
    aria-label="Criar nova solicitação de assistência"
    side="right"
    :dismissible="false"
    :close="false"
    :ui="{
      content: 'max-w-xl',
      footer: 'justify-end',
    }"
    v-bind="$attrs"
  >
    <template #body>
      <UForm
        id="ticket-create-form"
        ref="form"
        :state="state"
        :schema="TicketCreateSchema"
        :validate-on="['input', 'change']"
        :disabled="loading"
        :attach="false"
        transform
        @submit="onSubmit"
      >
        <div class="space-y-4">
          <UFormField label="Marca">
            <BrandSelectMenu
              v-model="brand"
              class="w-full"
              placeholder="Selecione uma marca"
            />
          </UFormField>

          <UFormField label="Categoria">
            <CategorySelectMenu
              v-model="category"
              :brand-id="brand"
              class="w-full"
              placeholder="Selecione uma categoria"
            />
          </UFormField>

          <UFormField label="Produto" name="productId" required>
            <ProductSelectMenu
              v-model="state.productId"
              :category-id="category"
              :brand-id="brand"
              class="w-full"
              placeholder="Selecione um produto"
            />
          </UFormField>

          <UFormField
            name="serialNumber"
            label="Número de Série / Código"
            required
          >
            <UInput
              v-model="state.serialNumber"
              type="text"
              placeholder="Ex.: 1234567890"
              class="w-full"
              :maxlength="500"
            />
          </UFormField>

          <UFormField name="description" label="Descrição do problema" required>
            <UTextarea
              v-model="state.description"
              placeholder="Descreva, de maneira objetiva, o problema que o produto está apresentando. Ex.: Produto apresenta falha no funcionamento do botão de liga/desliga, que não responde ao ser pressionado. O defeito foi identificado logo após a primeira utilização, impossibilitando o uso do equipamento."
              class="w-full"
              :rows="6"
              :maxrows="12"
              :maxlength="1000"
              autoresize
            />
          </UFormField>
        </div>

        <UAlert
          v-if="error"
          color="error"
          variant="solid"
          title="Oops! Ocorreu um erro"
          description="Não foi possível solicitar assistência técnica, tente novamente mais tarde."
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
        @click="
          () => {
            if (form?.dirty) {
              cancelModal = true;
            } else {
              onCancel();
            }
          }
        "
      >
        Cancelar
      </UButton>
      <UButton
        color="primary"
        class="cursor-pointer"
        :loading="loading"
        type="submit"
        form="ticket-create-form"
      >
        Solicitar assistência
      </UButton>
    </template>
  </USlideover>

  <UModal
    v-model:open="cancelModal"
    title="Cancelar solicitação"
    description="Você tem certeza que deseja cancelar a solicitação?"
    :dismissible="false"
    :close="false"
    :ui="{
      content: 'max-w-sm',
      footer: 'justify-end',
    }"
  >
    <template #footer>
      <UButton
        variant="ghost"
        color="neutral"
        class="cursor-pointer"
        @click="cancelModal = false"
      >
        Continuar solicitação
      </UButton>
      <UButton color="error" class="cursor-pointer" @click="onCancel()">
        Cancelar solicitação
      </UButton>
    </template>
  </UModal>
</template>
