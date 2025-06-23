<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import type { FetchError } from "ofetch";
import * as _ from "lodash-es";
import type { ITicketEntity } from "@musat/core";
import {
  TicketUpdateSchema,
  type TicketUpdateFormData,
} from "~/utils/schema/ticket.schema";

const props = defineProps<{
  ticket: ITicketEntity;
}>();

const open = defineModel<boolean>("open");

const emit = defineEmits<{
  success: [ticket: ITicketEntity];
  error: [error?: Error | FetchError];
}>();

const form = useTemplateRef("form");
const toast = useToast();
const state = reactive<TicketUpdateFormData>({
  status: props.ticket.status,
});
const api = useApi();
const loading = ref(false);
const error = ref<Error | FetchError | undefined>();

const onSubmit = async ({ data }: FormSubmitEvent<TicketUpdateFormData>) => {
  const body = _.cloneDeep(toRaw(data));

  if (!form.value?.dirty) {
    open.value = false;
    return;
  }

  try {
    loading.value = true;
    error.value = undefined;

    const res = await api<ITicketEntity>(uri`/tickets/${props.ticket.id}`, {
      method: "PATCH",
      body,
    });

    emit("success", res);
    open.value = false;

    toast.add({
      description: "Solicitação atualizada com sucesso!",
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
</script>

<template>
  <UModal
    v-model:open="open"
    title="Alterar status da solicitação"
    :dismissible="false"
    :close="false"
    :ui="{
      content: 'max-w-sm',
      footer: 'justify-end',
    }"
  >
    <template #body>
      <UForm
        id="ticket-update-form"
        ref="form"
        :state="state"
        :schema="TicketUpdateSchema"
        :validate-on="['input', 'change']"
        :disabled="loading"
        :attach="false"
        transform
        @submit="onSubmit"
      >
        <div class="space-y-4">
          <UFormField name="status" label="Status" required>
            <TicketStatusSelectMenu
              v-model="state.status"
              placeholder="Defina um status para a solicitação"
              class="w-full"
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
        form="ticket-update-form"
      >
        Salvar
      </UButton>
    </template>
  </UModal>
</template>
