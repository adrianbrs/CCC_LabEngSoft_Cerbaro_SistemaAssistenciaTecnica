<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import {
  AccountDeactivateSchema,
  type AccountDeactivateFormData,
  type AccountUpdateFormData,
} from "~/utils/schema/account.schema";
import * as _ from "lodash-es";
import type { ApiErrorResponse } from "~/plugins/api";

useHead({
  title: "Minha conta",
});

const { user, update, deactivate } = useUserSession(true);
const toast = useToast();
const accountForm = useTemplateRef("accountForm");
const editEnabled = ref(false);
const isSubmitting = ref(false);
const router = useRouter();

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

const delAccountModalOpen = ref(false);
const isDelettingAccount = ref(false);
const deactivateForm = useTemplateRef("deactivateForm");
const deactivateState = reactive<AccountDeactivateFormData>({
  currentPassword: "",
});

const onDeactivateAccount = async ({
  data,
}: FormSubmitEvent<AccountDeactivateFormData>) => {
  const body = _.cloneDeep(toRaw(data));

  try {
    isDelettingAccount.value = true;

    await deactivate(body, {
      onResponseError({ response }) {
        if (
          response.status === 401 &&
          (response._data as ApiErrorResponse)?.code === "INVALID_CREDENTIALS"
        ) {
          deactivateForm?.value?.setErrors(
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
            "Ocorreu um erro ao desativar sua conta. Por favor, tente novamente mais tarde.",
          color: "error",
          duration: 5000,
          close: true,
        });
      },
    });

    toast.add({
      title: "Conta desativada",
      description:
        "Sua conta foi desativada. Você pode reativá-la a qualquer momento realizando um novo login nos próximos 30 dias.",
      color: "success",
      duration: 10000,
      close: true,
    });

    router.replace("/login");
  } finally {
    isDelettingAccount.value = false;
  }
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

    <AccountUpdateForm
      id="account-form"
      ref="accountForm"
      v-model="state"
      :disabled="!editEnabled || isSubmitting"
      @submit="onSubmit"
    />

    <UAlert
      class="mt-8"
      title="Desativar conta"
      description="Sua conta permanecerá desativada por 30 dias. Após esse período, ela será excluída permanentemente."
      color="error"
      variant="soft"
    >
      <template #actions>
        <UModal
          v-model:open="delAccountModalOpen"
          title="Desativar conta"
          description="Tem certeza de que deseja desativar sua conta? Você poderá reativá-la a qualquer momento realizando um novo login nos próximos 30 dias."
          :ui="{ footer: 'justify-end' }"
        >
          <UButton
            label="Desativar conta"
            color="error"
            variant="solid"
            size="md"
            class="cursor-pointer"
          >
            Desativar conta
          </UButton>

          <template #body>
            <UForm
              id="account-deactivate-form"
              ref="deactivateForm"
              :attach="false"
              :schema="AccountDeactivateSchema"
              :state="deactivateState"
              :disabled="isDelettingAccount"
              :validate-on="['input', 'change']"
              @submit="onDeactivateAccount"
            >
              <UFormField label="Senha" name="currentPassword" required>
                <UInput
                  v-model="deactivateState.currentPassword"
                  type="password"
                  placeholder="Digite sua senha para continuar"
                  class="w-full"
                />
              </UFormField>
            </UForm>
          </template>

          <template #footer>
            <UButton
              label="Cancelar"
              variant="ghost"
              size="md"
              class="cursor-pointer"
              color="neutral"
              :disabled="isDelettingAccount"
              @click="delAccountModalOpen = false"
            >
              Cancelar
            </UButton>
            <UButton
              label="Desativar conta"
              color="error"
              variant="solid"
              size="md"
              class="cursor-pointer"
              type="submit"
              form="account-deactivate-form"
              :loading="isDelettingAccount"
            >
              Desativar conta
            </UButton>
          </template>
        </UModal>
      </template>
    </UAlert>
  </LayoutPage>
</template>
