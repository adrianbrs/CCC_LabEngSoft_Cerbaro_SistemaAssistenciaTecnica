<script setup lang="ts">
import { PasswordStrength } from "#components";
import type { IUserEntity } from "@musat/core";
import type { FormSubmitEvent, StepperItem } from "@nuxt/ui";
import { z } from "zod";
import type { AddressFormData } from "~/components/AddressForm.vue";

definePageMeta({
  layout: "single-card",
});

useHead({
  title: "Cadastre-se",
  meta: [
    {
      name: "description",
      content: "Crie uma conta para solicitar Assistência Técnica",
    },
  ],
});

const { $api } = useNuxtApp();
const router = useRouter();

const schema = z
  .object({
    name: z
      .string()
      .min(3, "O nome deve ter pelo menos 3 caracteres")
      .max(100, "O nome deve ter no máximo 100 caracteres")
      .regex(/[^\s]\s+[^\s]/, {
        message: "Por favor, informe seu nome completo",
      }),
    email: z.string().nonempty("Por favor, informe seu e-mail").email(),
    cpf: z
      .string()
      .nonempty("Por favor, informe seu CPF")
      .refine((value) => isValidCPF(value), {
        message: "O CPF informado é inválido",
      })
      .transform((value) => value.replace(/\D/g, "")),
    phone: z
      .string()
      .nonempty("Por favor, informe seu telefone")
      .transform((value) => value.replace(/\D/g, "")),
    password: z
      .string()
      .nonempty("A senha é obrigatória")
      .refine((value) => isStrongPassword(value), {
        message: "A senha não é forte o suficiente",
      }),
    passwordConfirmation: z.string().nonempty("Por favor, confirme sua senha"),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "As senhas não coincidem",
    path: ["passwordConfirmation"],
  });

type FormData = z.output<typeof schema> & { address: AddressFormData };

const state = reactive<FormData>({
  name: "",
  email: "",
  cpf: "",
  phone: "",
  password: "",
  passwordConfirmation: "",
  address: {
    street: "",
    number: "",
    neighborhood: "",
    complement: "",
    city: "",
    state: "",
    zipCode: "",
  },
});

const isSubmitting = ref(false);
const toast = useToast();

const onSubmit = async ({ data }: FormSubmitEvent<FormData>) => {
  const { passwordConfirmation: _, address, ...body } = toRaw(data);

  isSubmitting.value = true;

  try {
    const user = await $api<IUserEntity>("/users/register", {
      method: "POST",
      body: {
        ...body,
        address: {
          ...address,
          zipCode: address.zipCode.replace(/\D/g, ""),
        },
      },
      onResponseError({ response }) {
        const message = ([] as string[]).concat(response._data?.message ?? []);

        if (message.includes("CPF_ALREADY_EXISTS")) {
          toast.add({
            title: "Oops! CPF já cadastrado",
            description:
              "Já existe uma conta associada a esse CPF. Tente fazer login.",
            color: "error",
            duration: 5000,
            close: true,
          });

          if (stepper?.value?.hasPrev) {
            stepper.value.prev();
          }

          // FIXME: Errors disappear right after showing
          form.value?.setErrors(
            [
              {
                name: "cpf",
                message: "CPF já cadastrado",
              },
            ],
            "cpf"
          );
        }

        if (message.includes("EMAIL_ALREADY_EXISTS")) {
          toast.add({
            title: "Oops! E-mail já cadastrado",
            description:
              "Já existe uma conta associada a esse e-mail. Tente fazer login.",
            color: "error",
            duration: 5000,
            close: true,
          });

          if (stepper?.value?.hasPrev) {
            stepper.value.prev();
          }

          // FIXME: Errors disappear right after showing
          form.value?.setErrors(
            [
              {
                message: "E-mail já cadastrado",
              },
            ],
            "email"
          );
        }

        if (response.status !== 400) {
          toast.add({
            title: "Oops! Algo deu errado",
            description:
              "Ocorreu um erro ao criar sua conta. Tente novamente mais tarde.",
            color: "error",
            duration: 5000,
            close: true,
          });
        }
      },
    });

    toast.add({
      title: `Bem-vindo(a), ${user.name}!`,
      description:
        "Por favor, verifique seu e-mail para ativar sua conta e fazer login.",
      color: "success",
      duration: 10000,
      close: true,
    });

    router.replace("/login");
  } finally {
    isSubmitting.value = false;
  }
};

const items = [
  {
    title: "Dados pessoais",
    slot: "user" as const,
    icon: "i-lucide-user",
  },
  {
    title: "Endereço",
    slot: "address" as const,
    icon: "i-lucide-map-pin",
  },
] satisfies StepperItem[];

const form = useTemplateRef("form");
const stepper = useTemplateRef("stepper");
</script>

<template>
  <UCard class="w-full md:w-[500px]">
    <template #header>
      <h2 class="text-xl">Cadastre-se</h2>
    </template>

    <UForm
      ref="form"
      :schema="schema"
      :state="state"
      :validate-on="['input', 'change']"
      :disabled="isSubmitting"
      @submit="onSubmit"
    >
      <UStepper
        ref="stepper"
        :items="items"
        disabled
        class="w-full"
        size="sm"
        :ui="{
          content: 'space-y-4',
        }"
      >
        <template #user>
          <UFormField label="Nome" name="name" required>
            <UInput
              v-model="state.name"
              class="w-full"
              placeholder="Nome completo"
              :autofocus="!state.name"
            />
          </UFormField>

          <UFormField label="E-mail" name="email" required>
            <UInput
              v-model="state.email"
              class="w-full"
              placeholder="meu@email.com"
            />
          </UFormField>

          <UFormField label="CPF" name="cpf" required>
            <UInput
              v-model="state.cpf"
              v-maska
              class="w-full"
              data-maska="###.###.###-##"
              placeholder="000.000.000-00"
            />
          </UFormField>

          <UFormField label="Telefone" name="phone" required>
            <UInput
              v-model="state.phone"
              v-maska
              class="w-full"
              data-maska="['(##) # ####-####', '(##) ####-####']"
              placeholder="(00) 0 0000-0000"
            />
          </UFormField>

          <div class="max-md:space-y-4 md:grid md:grid-cols-2 md:gap-4">
            <UFormField label="Senha" name="password" required>
              <PasswordStrength
                v-slot="{ open, close }"
                :password="state.password"
              >
                <PasswordInput
                  v-model="state.password"
                  class="w-full"
                  placeholder="Informe uma senha"
                  @focus="open"
                  @blur="close"
                />
              </PasswordStrength>
            </UFormField>

            <UFormField
              label="Confirmação de senha"
              name="passwordConfirmation"
              required
            >
              <PasswordInput
                v-model="state.passwordConfirmation"
                class="w-full"
                placeholder="Confirme sua senha"
              />
            </UFormField>
          </div>
        </template>

        <template #address>
          <AddressForm v-model="state.address" />
        </template>
      </UStepper>

      <div class="grid grid-cols-2 gap-4 mt-8">
        <UButton
          v-if="stepper?.hasPrev"
          class="cursor-pointer justify-self-start"
          color="neutral"
          variant="subtle"
          :disabled="isSubmitting"
          @click="stepper?.prev()"
          >Voltar</UButton
        >
        <UButton
          v-if="stepper?.hasNext"
          class="cursor-pointer col-2 justify-self-end"
          @click="
            async () => {
              await form?.validate({ nested: false });
              stepper?.next();
            }
          "
          >Continuar</UButton
        >
        <UButton
          v-else
          type="submit"
          class="cursor-pointer col-2 justify-self-end"
          :disabled="isSubmitting"
        >
          Criar conta
        </UButton>
      </div>
    </UForm>

    <template #footer>
      <p class="text-center">
        Já tem uma conta?
        <ULink to="/login">Entrar</ULink>
      </p>
    </template>
  </UCard>
</template>
