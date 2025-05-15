<script lang="ts">
import type { ICepInfoEntity } from "@musat/core";
import { z } from "zod";

const addressSchema = z.object({
  street: z.string().min(3, "A rua deve ter pelo menos 3 caracteres").max(100),
  number: z.string().max(10).optional(),
  neighborhood: z
    .string()
    .min(3, "O bairro deve ter pelo menos 3 caracteres")
    .max(100),
  complement: z.string().max(255).optional(),
  city: z.string().min(3, "A cidade deve ter pelo menos 3 caracteres").max(64),
  state: z.string().length(2, "O estado deve ter exatamente 2 caracteres"),
  zipCode: z.string().refine((value) => /^\d{5}-\d{3}$/.test(value), {
    message: "Informe um CEP válido",
  }),
});

export type AddressFormData = z.output<typeof addressSchema>;
</script>

<script setup lang="ts">
const model = defineModel<AddressFormData>({ required: true });
const form = useTemplateRef("form");

const zipCode = computed(() => {
  return model.value?.zipCode.replace(/\D+/g, "");
});

const {
  data: zipCodeInfo,
  execute,
  error,
  status,
  clear,
} = useApi<ICepInfoEntity>(() => uri`/address/cep/${zipCode.value}`, {
  immediate: false,
  watch: false,
});

const isZipCodeLoading = computed(() => {
  return status.value === "pending";
});

watch(
  () => zipCode.value,
  () => {
    clear();
  }
);

const zipCodeError = computed(() => {
  if (error.value) {
    const { status } = error.value;
    if (status === 404) {
      return "CEP não encontrado";
    }
    if (status !== 200) {
      return "CEP inválido";
    }
  }
  return undefined;
});

const loadZipCodeInfo = async () => {
  if (
    isZipCodeLoading.value ||
    zipCode.value === zipCodeInfo.value?.cep ||
    error.value
  ) {
    return;
  }
  await form.value?.validate({ name: "zipCode" });
  await execute();

  if (!zipCodeInfo.value) {
    return;
  }

  const { street, city, state, neighborhood } = zipCodeInfo.value;
  Object.assign(model.value, {
    street,
    city,
    state,
    neighborhood,
  });
};
</script>

<template>
  <UForm
    ref="form"
    class="space-y-4"
    :schema="addressSchema"
    :state="modelValue"
    :validate-on="['input', 'change']"
  >
    <UFormField name="zipCode" label="CEP" required :error="zipCodeError">
      <UInput
        v-model="modelValue.zipCode"
        v-maska
        data-maska="#####-###"
        class="w-full"
        :loading="isZipCodeLoading"
        placeholder="00000-000"
        :autofocus="!modelValue.zipCode"
        @blur="loadZipCodeInfo"
      >
        <template #trailing>
          <UButton
            v-if="isZipCodeLoading"
            variant="ghost"
            class="cursor-pointer"
            color="neutral"
            @click="clear"
          >
            <UIcon name="i-lucide-x" />
          </UButton>
        </template>
      </UInput>
    </UFormField>

    <div class="max-md:space-y-4 md:grid md:grid-cols-3 md:gap-4">
      <UFormField class="col-span-2" name="street" label="Nome da Rua" required>
        <UInput
          v-model="modelValue.street"
          class="w-full"
          placeholder="Informe o nome da rua"
          :disabled="isZipCodeLoading"
        />
      </UFormField>

      <UFormField name="number" label="Número">
        <UInput
          v-model="modelValue.number"
          class="w-full"
          placeholder="(opcional)"
        />
      </UFormField>
    </div>

    <UFormField name="neighborhood" label="Bairro">
      <UInput
        v-model="modelValue.neighborhood"
        class="w-full"
        placeholder="Informe o bairro"
        :disabled="isZipCodeLoading"
      />
    </UFormField>

    <UFormField name="complement" label="Complemento">
      <UInput
        v-model="modelValue.complement"
        class="w-full"
        placeholder="Ex.: Casa, Apto, etc..."
      />
    </UFormField>

    <div class="max-md:space-y-4 md:grid md:grid-cols-2 md:gap-4">
      <UFormField name="state" label="Estado" required>
        <UInput
          v-model="modelValue.state"
          v-maska
          data-maska="ZZ"
          data-maska-tokens="Z:[A-Z]"
          class="w-full"
          placeholder="UF"
          :disabled="isZipCodeLoading"
        />
      </UFormField>

      <UFormField name="city" label="Cidade" required>
        <UInput
          v-model="modelValue.city"
          class="w-full"
          placeholder="Nome da Cidade"
          :disabled="isZipCodeLoading"
        />
      </UFormField>
    </div>
  </UForm>
</template>
