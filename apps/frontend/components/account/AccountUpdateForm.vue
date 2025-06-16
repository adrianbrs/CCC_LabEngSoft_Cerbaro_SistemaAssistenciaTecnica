<script setup lang="ts">
import {
  AccountUpdateSchema,
  type AccountPasswordUpdateFormData,
  type AccountUpdateFormData,
} from "~/utils/schema/account.schema";
import AccountPasswordUpdateForm from "./AccountPasswordUpdateForm.vue";
import type { FormError, FormSubmitEvent } from "@nuxt/ui";

const { disabled, onSubmit = () => {} } = defineProps<{
  disabled?: boolean;
  onSubmit?:
    | ((event: FormSubmitEvent<AccountUpdateFormData>) => void | Promise<void>)
    | (() => void | Promise<void>);
}>();

const model = defineModel<AccountUpdateFormData>({
  required: true,
});

const { user } = useUserSession(true);
const form = useTemplateRef("form");
const passwordModalOpen = ref(false);
const showCurrentPasswordModal = ref(false);

watchEffect(() => {
  if (
    form?.value?.errors?.some(
      (err: FormError) => err.name === "currentPassword"
    )
  ) {
    showCurrentPasswordModal.value = true;
  }
});

watch(showCurrentPasswordModal, (open) => {
  if (open) {
    // Clear initial error when opening the modal
    // We must wait for the next frame to avoid allowing form submission
    requestAnimationFrame(() => {
      form?.value?.clear("currentPassword");
    });
  }
});

const handleSubmit = async (event: FormSubmitEvent<AccountUpdateFormData>) => {
  await Promise.resolve(onSubmit?.(event));
  if (!form?.value?.errors?.length) {
    showCurrentPasswordModal.value = false;
  }
};

defineExpose({
  form,
});
</script>

<template>
  <UForm
    ref="form"
    :schema="AccountUpdateSchema"
    :state="model"
    :validate-on="['input', 'change']"
    :disabled="disabled"
    class="space-y-4"
    @submit="handleSubmit"
  >
    <UModal
      :open="showCurrentPasswordModal"
      title="Confirmar alterações"
      description="Você alterou informações que requerem uma confirmação de segurança"
      :close="false"
      :dismissible="false"
      :ui="{ footer: 'justify-end' }"
      @after:leave="
        () => {
          if (!form?.loading) {
            model.currentPassword = undefined;
            form?.clear('currentPassword');
          }
        }
      "
    >
      <template #body>
        <UFormField label="Senha atual" name="currentPassword" required>
          <UInput
            v-model="model.currentPassword"
            type="password"
            class="w-full"
            placeholder="Informe sua senha"
          />
        </UFormField>
      </template>

      <template #footer>
        <UButton
          label="Cancelar"
          color="neutral"
          variant="ghost"
          class="cursor-pointer"
          @click="showCurrentPasswordModal = false"
        />
        <UButton
          label="Confirmar"
          type="submit"
          class="cursor-pointer"
          :loading="form?.loading"
          @click="form?.submit()"
        >
          Salvar alterações
        </UButton>
      </template>
    </UModal>

    <section>
      <h2 class="text-lg text-muted mb-4">Informações pessoais</h2>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <UFormField label="Nome" name="name" required>
          <UInput
            v-model="model.name"
            type="text"
            class="w-full"
            placeholder="Nome completo"
          />
        </UFormField>

        <UFormField label="Telefone" name="phone" required>
          <UInput
            v-model="model.phone"
            v-maska
            type="tel"
            class="w-full"
            data-maska="['(##) # ####-####', '(##) ####-####']"
            placeholder="(00) 0 0000-0000"
          />
        </UFormField>
        <UFormField label="E-Mail" name="email" required>
          <UInput
            :model-value="user.email"
            type="email"
            class="w-full"
            placeholder="nome@exemplo.com"
            disabled
          />
        </UFormField>

        <UFormField label="CPF" name="cpf" required>
          <UInput
            v-maska
            :model-value="user.cpf"
            class="w-full"
            data-maska="###.###.###-##"
            placeholder="000.000.000-00"
            disabled
          />
        </UFormField>

        <UFormField label="Senha" name="password" required>
          <UInput
            :model-value="model.password"
            placeholder="********"
            type="password"
            class="w-full"
            disabled
          >
            <template v-if="!disabled" #trailing>
              <UModal
                v-model:open="passwordModalOpen"
                title="Alterar senha"
                description="Altere a senha de acesso da sua conta"
                :close="false"
                :dismissible="false"
                :ui="{ footer: 'justify-end' }"
              >
                <UButton variant="link" size="sm" icon="i-lucide-edit">
                  Alterar
                </UButton>

                <template #body>
                  <AccountPasswordUpdateForm
                    id="password-update-form"
                    :attach="false"
                    @submit="({ data }: FormSubmitEvent<AccountPasswordUpdateFormData>) => {
                      model.password = data.password;
                      passwordModalOpen = false;
                    }"
                  />
                </template>

                <template #footer>
                  <UButton
                    label="Cancelar"
                    color="neutral"
                    variant="ghost"
                    class="cursor-pointer"
                    @click="passwordModalOpen = false"
                  />
                  <UButton
                    label="Confirmar"
                    type="submit"
                    class="cursor-pointer"
                    form="password-update-form"
                  />
                </template>
              </UModal>
            </template>
          </UInput>
        </UFormField>
      </div>
    </section>

    <section>
      <h2 class="text-lg text-muted mb-4">Endereço</h2>

      <AddressForm
        v-if="model.address"
        v-model="model.address"
        :disabled="disabled"
        :validate-on="['input', 'change']"
        class="space-y-4"
      />
    </section>
  </UForm>
</template>
