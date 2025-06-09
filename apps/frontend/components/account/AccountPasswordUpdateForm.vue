<script setup lang="ts">
import {
  AccountPasswordUpdateSchema,
  type AccountPasswordUpdateFormData,
} from "~/utils/schema/account.schema";

const model = defineModel<AccountPasswordUpdateFormData>({
  default: () =>
    reactive<AccountPasswordUpdateFormData>({
      password: "",
      passwordConfirmation: "",
    }),
});

const form = useTemplateRef("form");

defineExpose({
  form,
});
</script>

<template>
  <UForm
    ref="form"
    :schema="AccountPasswordUpdateSchema"
    :state="model"
    :validate-on="['input', 'change']"
    class="space-y-4"
  >
    <UFormField label="Nova senha" name="password" required>
      <PasswordStrength v-slot="{ open, close }" :password="model.password">
        <PasswordInput
          v-model="model.password"
          class="w-full"
          placeholder="********"
          @focus="open"
          @blur="close"
        />
      </PasswordStrength>
    </UFormField>

    <UFormField
      label="Confirmação da senha"
      name="passwordConfirmation"
      required
    >
      <PasswordInput
        v-model="model.passwordConfirmation"
        class="w-full"
        placeholder="********"
      />
    </UFormField>
  </UForm>
</template>
