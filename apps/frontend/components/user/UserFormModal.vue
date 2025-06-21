<script setup lang="ts">
import type { IUserEntity } from "@musat/core";
import type { FormSubmitEvent } from "@nuxt/ui";
import type { FetchError } from "ofetch";
import {
  UserUpdateSchema,
  type UserUpdateFormData,
} from "~/utils/schema/user.schema";
import * as _ from "lodash-es";
import { getRoleLabel } from "./UserRoleBadge.vue";
import UserRoleSelectMenu from "./UserRoleSelectMenu.vue";

const open = defineModel<boolean>("open");

const props = defineProps<{
  user: IUserEntity;
}>();

const emit = defineEmits<{
  success: [user: IUserEntity];
  error: [error?: Error | FetchError];
}>();

const form = useTemplateRef("form");
const toast = useToast();
const state = reactive<UserUpdateFormData>({
  role: props.user.role,
});
const api = useApi();
const loading = ref(false);
const error = ref<Error | FetchError | undefined>();

const onSubmit = async ({ data }: FormSubmitEvent<UserUpdateFormData>) => {
  const body = _.cloneDeep(toRaw(data));

  try {
    loading.value = true;
    error.value = undefined;

    const res = await api<IUserEntity>(uri`/users/${props.user.id}`, {
      method: "PATCH",
      body: body,
    });

    emit("success", res);
    open.value = false;

    toast.add({
      title: "Cargo atualizado!",
      description: `O cargo do usuário "${
        res.name
      }" foi definido para "${getRoleLabel(res.role)}".`,
      color: "success",
      icon: "i-lucide-circle-check",
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
    title="Editar Usuário"
    :aria-label="`Editar usuário ${props.user.name}`"
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
        :schema="UserUpdateSchema"
        :validate-on="['input', 'change']"
        :disabled="loading"
        :attach="false"
        transform
        @submit="onSubmit"
      >
        <UFormField name="role" label="Cargo" required>
          <UserRoleSelectMenu
            v-model="state.role"
            placeholder="Selecione o cargo do usuário"
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
