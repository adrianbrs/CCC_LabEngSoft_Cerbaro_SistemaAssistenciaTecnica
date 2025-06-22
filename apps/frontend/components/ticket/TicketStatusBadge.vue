<script lang="ts">
import { TicketStatus } from "@musat/core";
import type { BadgeProps } from "@nuxt/ui";

interface StatusOptions extends BadgeProps {
  label: string;
}

const statusOptions: Partial<Record<TicketStatus, StatusOptions>> = {
  [TicketStatus.OPEN]: {
    color: "primary",
    label: "Aberto",
  },
  [TicketStatus.ACCEPTED]: {
    color: "info",
    label: "Aguardando técnico",
  },
  [TicketStatus.IN_PROGRESS]: {
    color: "primary",
    label: "Em andamento",
  },
  [TicketStatus.CANCELLED]: {
    color: "neutral",
    label: "Cancelado",
  },
  [TicketStatus.AWAITING_CLIENT]: {
    color: "warning",
    label: "Aguardando resposta",
  },
  [TicketStatus.RESOLVED]: {
    color: "success",
    variant: "subtle",
    label: "Solucionado",
  },
};

export const getTicketLabel = (role: TicketStatus): string => {
  return statusOptions[role]?.label ?? "Desconhecido";
};
</script>

<script setup lang="ts">
const { status, size = "md" } = defineProps<{
  status: TicketStatus;
  size?: BadgeProps["size"];
}>();

const options = computed(() => {
  const { label, ...props } = statusOptions[status] ?? {
    label: "Desconhecido",
    color: "neutral",
    variant: "soft",
  };

  return {
    label,
    props,
  };
});
</script>

<template>
  <UBadge
    variant="outline"
    class="rounded-full"
    v-bind="options.props"
    :size="size"
    :ui="{
      base: 'justify-center',
    }"
  >
    {{ options.label }}
  </UBadge>
</template>
