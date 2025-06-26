<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { z } from "zod";

definePageMeta({
  layout: "single-card",
  middleware: ["guest"],
  auth: false,
});

useHead({
  title: "Recuperar senha",
  meta: [
    {
      name: "description",
      content: "Recupere a senha da sua conta para acessar o sistema",
    },
  ],
});
const schema = z.object({
  email: z.string().email().nonempty("Por favor, informe seu e-mail"),
});

type FormData = z.output<typeof schema>;

const { recover } = useUserSession();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const isSubmitting = ref(false);
const hasError = ref(false);
const state = reactive<FormData>({
  email: "",
});

const onSubmit = async ({ data: { email } }: FormSubmitEvent<FormData>) => {
  if (isSubmitting.value) {
    return;
  }

  hasError.value = false;
  isSubmitting.value = true;

  try {
    await recover(email);

    toast.add({
      color: "success",
      title: "Recuperação de senha solicitada",
      description:
        "Você receberá um e-mail em breve com instruções para redefinir sua senha.",
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
      title: "Erro ao recuperar conta",
      description:
        "Não foi possível enviar o e-mail de recuperação. Por favor, tente novamente mais tarde.",
      duration: 6000,
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
      <h2 class="text-xl">Recuperar senha</h2>
    </template>

    <UForm
      class="space-y-4"
      :schema="schema"
      :state="state"
      :validate-on="['input', 'change']"
      :disabled="isSubmitting"
      @submit="onSubmit"
    >
      <p class="text-muted text-sm">
        Informe seu e-mail abaixo e enviaremos instruções para redefinir sua
        senha.
      </p>

      <UFormField name="email" label="E-mail" required>
        <UInput
          v-model="state.email"
          type="email"
          placeholder="email@example.com"
          :disabled="isSubmitting"
          class="w-full"
          autofocus
          autocomplete="email"
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
