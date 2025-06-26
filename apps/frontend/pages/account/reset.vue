<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import {
  AccountPasswordUpdateSchema,
  type AccountPasswordUpdateFormData,
} from "~/utils/schema/account.schema";

definePageMeta({
  layout: "single-card",
  middleware: ["guest"],
  auth: false,
  validate(route) {
    const {
      query: { user, token },
    } = route;

    if (
      typeof user !== "string" ||
      typeof token !== "string" ||
      !user ||
      !token
    ) {
      return {
        statusCode: 400,
        statusMessage: "Usuário ou token não encontrados.",
      };
    }

    return true;
  },
});

useHead({
  title: "Redefinir senha",
  meta: [
    {
      name: "description",
      content: "Redefina a senha da sua conta para acessar o sistema",
    },
  ],
});

const { reset } = useUserSession();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const isSubmitting = ref(false);
const hasError = ref(false);
const state = reactive<AccountPasswordUpdateFormData>({
  password: "",
  passwordConfirmation: "",
});

const onSubmit = async ({
  data: { password },
}: FormSubmitEvent<AccountPasswordUpdateFormData>) => {
  if (isSubmitting.value) {
    return;
  }

  hasError.value = false;
  isSubmitting.value = true;

  try {
    await reset(route.query.user as string, {
      token: route.query.token as string,
      password,
    });

    toast.add({
      color: "success",
      title: "Senha redefinda com sucesso",
      description:
        "Sua senha foi redefinida com sucesso. Você já pode acessar sua conta.",
      duration: 6000,
      close: true,
    });

    router.replace({
      path: "/login",
      query: route.query,
    });
  } catch (err) {
    console.error(err);

    toast.add({
      color: "error",
      title: "Erro ao redefinir senha",
      description:
        "Não foi possível redefinir sua senha. Verifique o link de recuperação enviado no seu e-mail ou tente novamente mais tarde.",
      duration: 8000,
      close: true,
    });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <UCard class="w-full sm:w-[500px]">
    <template #header>
      <h2 class="text-xl">Redefinir senha</h2>
    </template>

    <UForm
      class="space-y-4"
      :schema="AccountPasswordUpdateSchema"
      :state="state"
      :validate-on="['input', 'change']"
      :disabled="isSubmitting"
      @submit="onSubmit"
    >
      <UFormField label="Nova senha" name="password" required>
        <PasswordStrength v-slot="{ open, close }" :password="state.password">
          <PasswordInput
            v-model="state.password"
            class="w-full"
            placeholder="Defina uma nova senha"
            autocomplete="new-password"
            @focus="open"
            @blur="close"
          />
        </PasswordStrength>
      </UFormField>

      <UFormField
        label="Confirmação da nova senha"
        name="passwordConfirmation"
        required
      >
        <PasswordInput
          v-model="state.passwordConfirmation"
          class="w-full"
          placeholder="Confirme sua senha"
        />
      </UFormField>

      <div class="flex items-center justify-end mt-8">
        <UButton
          class="cursor-pointer col-2"
          type="submit"
          :loading="isSubmitting"
          icon="i-lucide-arrow-right"
          trailing
        >
          Redefinir senha
        </UButton>
      </div>
    </UForm>

    <template #footer>
      <p class="text-center">
        Lembrou a senha?
        <ULink to="/login">Entre</ULink>
      </p>
    </template>
  </UCard>
</template>
