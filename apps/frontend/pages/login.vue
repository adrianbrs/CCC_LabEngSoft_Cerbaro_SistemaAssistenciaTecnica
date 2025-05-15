<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { FetchError } from "ofetch";
import { z } from "zod";

definePageMeta({
  layout: "single-card",
  middleware: ["guest"],
});

useHead({
  title: "Entrar",
  meta: [
    {
      name: "description",
      content: "Acesse sua conta para solicitar Assistência Técnica",
    },
  ],
});

const schema = z.object({
  email: z.string().email().nonempty("Por favor, informe seu e-mail"),
  password: z.string().nonempty("Por favor, informe sua senha"),
});

type FormData = z.output<typeof schema>;

const { login } = useUserSession();
const router = useRouter();
const toast = useToast();
const passwordInput = useTemplateRef("passwordInput");
const isSubmitting = ref(false);
const hasError = ref(false);
const state = reactive<FormData>({
  email: "",
  password: "",
});

const onSubmit = async ({
  data: { email, password },
}: FormSubmitEvent<FormData>) => {
  if (isSubmitting.value) {
    return;
  }

  hasError.value = false;
  isSubmitting.value = true;

  try {
    await login(email, password);
    router.replace("/");
  } catch (err) {
    if (err instanceof FetchError) {
      if (err.response?.status === 400) {
        toast.add({
          color: "error",
          title: "Credenciais inválidas",
          description: "E-mail ou senha incorretos.",
          duration: 5000,
          close: true,
        });

        hasError.value = true;

        requestAnimationFrame(() => {
          passwordInput.value?.inputRef?.focus();
        });

        return;
      }
    }

    toast.add({
      color: "error",
      title: "Erro ao realizar login",
      description:
        "Não foi possível realizar o login. Tente novamente mais tarde.",
      duration: 5000,
      close: true,
    });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <UCard class="w-full md:w-[500px]">
    <template #header>
      <h2 class="text-xl">Entrar</h2>
    </template>

    <UForm
      class="space-y-4"
      :schema="schema"
      :state="state"
      :validate-on="['input', 'change']"
      :disabled="isSubmitting"
      @submit="onSubmit"
    >
      <UFormField name="email" label="E-mail" required>
        <UInput
          v-model="state.email"
          type="email"
          placeholder="email@example.com"
          :disabled="isSubmitting"
          class="w-full"
          autofocus
        />
      </UFormField>

      <div>
        <UFormField name="password" label="Senha" required>
          <PasswordInput
            ref="passwordInput"
            v-model="state.password"
            :disabled="isSubmitting"
            placeholder="********"
            class="w-full"
          />
        </UFormField>

        <ULink to="/account/recover" class="text-sm">Esqueceu a senha?</ULink>
      </div>

      <div class="flex gap-4 items-center mt-8">
        <div class="flex-1">
          <p
            v-if="hasError"
            class="flex items-center gap-2 text-sm text-red-500"
          >
            <UIcon name="i-lucide-alert-triangle" />
            <span>E-mail ou senha incorretos.</span>
          </p>
        </div>

        <UButton
          class="cursor-pointer col-2"
          type="submit"
          :loading="isSubmitting"
          icon="i-lucide-arrow-right"
          trailing
        >
          Entrar
        </UButton>
      </div>
    </UForm>

    <template #footer>
      <p class="text-center">
        Ainda não tem uma conta?
        <ULink to="/register">Cadastre-se</ULink>
      </p>
    </template>
  </UCard>
</template>
