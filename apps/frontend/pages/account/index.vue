<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import type { AccountUpdateFormData } from "~/utils/schema/account.schema";
import * as _ from "lodash-es";
import type { ApiErrorResponse } from "~/plugins/api";

useHead({
  title: "Minha conta",
});

const { user, update } = useUserSession(true);
const toast = useToast();
const accountForm = useTemplateRef("accountForm");
const editEnabled = ref(false);
const isSubmitting = ref(false);

const defaults = computed<AccountUpdateFormData>(() => ({
  name: user.value.name,
  phone: user.value.phone,
  password: undefined,
  email: undefined,
  currentPassword: undefined,
  address: {
    ..._.pick(user.value.address, [
      "street",
      "city",
      "number",
      "neighborhood",
      "complement",
      "state",
      "zipCode",
    ]),
  },
}));
const state = reactive<AccountUpdateFormData>(_.cloneDeep(defaults.value));

const startEditing = () => {
  editEnabled.value = true;
};

const stopEditing = () => {
  editEnabled.value = false;
  Object.assign(state, _.cloneDeep(defaults.value));
  accountForm.value?.form?.clear();
};

const onSubmit = async ({ data }: FormSubmitEvent<AccountUpdateFormData>) => {
  const body = _.cloneDeep(toRaw(data));

  try {
    isSubmitting.value = true;

    await update(body, {
      onResponseError({ response }) {
        if (
          response.status === 401 &&
          (response._data as ApiErrorResponse)?.code === "INVALID_CREDENTIALS"
        ) {
          accountForm?.value?.form?.setErrors(
            [
              {
                name: "currentPassword",
                message: "Senha incorreta. Por favor, tente novamente.",
              },
            ],
            "currentPassword"
          );
          return;
        }

        toast.add({
          title: "Oops! Algo deu errado",
          description:
            "Ocorreu um erro ao atualizar as informações da sua conta. Por favor, tente novamente mais tarde.",
          color: "error",
          duration: 5000,
          close: true,
        });
      },
    });

    toast.add({
      title: "Perfil atualizado",
      description: "As informações da sua conta foram atualizadas com sucesso.",
      color: "success",
      duration: 5000,
      close: true,
    });

    stopEditing();
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <LayoutPage title="Minha conta">
    <AccountUpdateForm
      id="account-form"
      ref="accountForm"
      v-model="state"
      :disabled="!editEnabled || isSubmitting"
      @submit="onSubmit"
    />

    <LayoutPageHeaderActions>
      <template v-if="editEnabled">
        <UButton
          type="submit"
          form="account-form"
          variant="soft"
          size="md"
          class="w-full sm:w-auto cursor-pointer"
          :loading="isSubmitting"
        >
          Salvar
        </UButton>

        <UButton
          type="button"
          variant="ghost"
          size="md"
          color="neutral"
          class="w-full sm:w-auto cursor-pointer"
          :disabled="isSubmitting"
          @click="stopEditing"
        >
          Cancelar
        </UButton>
      </template>

      <template v-else>
        <UButton
          type="button"
          variant="soft"
          size="md"
          class="w-full sm:w-auto cursor-pointer"
          icon="i-heroicons-pencil-square"
          @click="startEditing"
        >
          Editar
        </UButton>
      </template>
    </LayoutPageHeaderActions>
  </LayoutPage>
</template>
