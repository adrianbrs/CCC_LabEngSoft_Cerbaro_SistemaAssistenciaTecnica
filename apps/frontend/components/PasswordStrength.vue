<script lang="ts">
export interface PasswordStrengthRequirement {
  rule: RegExp | ((password: string) => boolean);
  text: string;
}

export const DEFAULT_REQUIREMENTS: Readonly<PasswordStrengthRequirement[]> = [
  { rule: (str) => str.length >= 8, text: "No mínimo 8 caracteres" },
  { rule: /[a-z]/, text: "Pelo menos 1 letra minúscula" },
  { rule: /[A-Z]/, text: "Pelo menos 1 letra maiúscula" },
  { rule: /\d/, text: "Pelo menos 1 número" },
  { rule: /[^A-Za-z0-9]/, text: "Pelo menos 1 caractere especial" },
] as const;
</script>

<script setup lang="ts">
const { password, requirements = DEFAULT_REQUIREMENTS } = defineProps<{
  password: string;
  requirements?: Readonly<PasswordStrengthRequirement[]>;
}>();

const checkStrength = (str: string) => {
  return requirements.map((req) => ({
    met: req.rule instanceof RegExp ? req.rule.test(str) : req.rule(str),
    text: req.text,
  }));
};

const strength = computed(() => checkStrength(password ?? ""));
const score = computed(() => strength.value.filter((req) => req.met).length);

const color = computed(() => {
  if (score.value === 0) return "neutral";
  if (score.value <= 2) return "error";
  if (score.value < 5) return "warning";
  return "success";
});

const text = computed(() => {
  if (score.value <= 2) return "Fraca";
  if (score.value === 3) return "Média";
  if (score.value === 4) return "Forte";
  return "Muito forte";
});

const isOpen = ref(false);

const open = () => {
  isOpen.value = true;
};

const close = () => {
  isOpen.value = false;
};
</script>

<template>
  <UPopover
    :open="isOpen"
    :dismissable="false"
    :content="{
      align: 'start',
    }"
    :ui="{
      content: 'p-2 space-y-2',
    }"
  >
    <div>
      <slot :is-open="isOpen" :open="open" :close="close" />

      <UProgress
        class="mt-2"
        :color="color"
        :indicator="text"
        :model-value="Math.min(score, 4)"
        :max="4"
        size="sm"
      />
    </div>

    <template #content>
      <p class="text-sm font-medium">Segurança: {{ text }}</p>

      <ul class="space-y-1" aria-label="Requisitos da senha">
        <li
          v-for="(req, index) in strength"
          :key="index"
          class="flex items-center gap-1"
          :class="req.met ? 'text-success' : 'text-muted'"
        >
          <UIcon
            :name="req.met ? 'i-lucide-circle-check' : 'i-lucide-circle-x'"
            class="size-4 shrink-0"
          />

          <span class="text-xs font-light">
            {{ req.text }}
            <span class="sr-only">
              {{
                req.met ? " - Requisito cumprido" : " - Requisito não cumprido"
              }}
            </span>
          </span>
        </li>
      </ul>
    </template>
  </UPopover>
</template>
