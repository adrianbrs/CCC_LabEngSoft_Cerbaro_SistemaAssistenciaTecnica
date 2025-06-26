<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

definePageMeta({
  layout: "single-card",
  middleware: ["guest"],
  auth: false,
});

useHead({
  title: "Redefinir senha",
  meta: [
    {
      name: "description",
      content: "Digite sua nova senha para acessar sua conta.",
    },
  ],
});

const route = useRoute();
const router = useRouter();
const { $api } = useNuxtApp();
const toast = useToast();

const schema = z
  .object({
    email: z.string().email("E-mail inválido"),
    newPassword: z.string().min(8, "A senha deve ter ao menos 8 caracteres"),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.newPassword === data.passwordConfirmation, {
    path: ["passwordConfirmation"],
    message: "As senhas não coincidem",
  });

type FormData = z.output<typeof schema>;

const state = reactive<FormData>({
  email: "",
  newPassword: "",
  passwordConfirmation: "",
});

const isSubmitting = ref(false);

const onSubmit = async ({ data }: FormSubmitEvent<FormData>) => {
  isSubmitting.value = true;

  try {
    await $api("/users/reset-password", {
      method: "POST",
      body: {
        email: data.email,
        token: route.query.token, // token via query param
        newPassword: data.newPassword,
      },
      onResponseError({ response }) {
        const message = ([] as string[]).concat(response._data?.message ?? []);

        toast.add({
          title: "Erro ao redefinir senha",
          description:
            message.join(", ") || "Não foi possível redefinir sua senha.",
          color: "error",
          close: true,
        });
      },
    });

    toast.add({
      title: "Senha redefinida com sucesso!",
      description: "Você já pode fazer login com sua nova senha.",
      color: "success",
      duration: 6000,
      close: true,
    });

    router.push("/login");
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <UCard class="w-full sm:w-[500px]">
    <template #header>
      <h2 class="text-xl">Redefinir Senha</h2>
    </template>

    <UForm
      :schema="schema"
      :state="state"
      @submit="onSubmit"
      :disabled="isSubmitting"
    >
      <UFormField label="E-mail" name="email" required>
        <UInput
          v-model="state.email"
          type="email"
          class="w-full"
          placeholder="meu@email.com"
        />
      </UFormField>

      <UFormField label="Nova senha" name="newPassword" required>
        <PasswordInput
          v-model="state.newPassword"
          placeholder="Nova senha"
          autocomplete="new-password"
        />
      </UFormField>

      <UFormField label="Confirme a nova senha" name="passwordConfirmation" required>
        <PasswordInput
          v-model="state.passwordConfirmation"
          placeholder="Confirme a nova senha"
          autocomplete="new-password"
        />
      </UFormField>

      <UButton
        type="submit"
        class="w-full mt-4"
        :loading="isSubmitting"
        icon="i-lucide-lock"
        trailing
      >
        Redefinir senha
      </UButton>
    </UForm>

    <template #footer>
      <p class="text-center">
        Lembrou sua senha?
        <ULink to="/login">Entre</ULink>
      </p>
    </template>
  </UCard>
</template>