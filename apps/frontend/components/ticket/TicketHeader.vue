<script setup lang="ts">
import type { ITicketEntity } from "@musat/core";
import type { AccordionItem } from "@nuxt/ui";

type TicketHeaderSlot = (typeof items)["value"][number]["slot"];

const { ticket } = defineProps<{
  ticket: ITicketEntity;
}>();
const expandedModel = defineModel<TicketHeaderSlot>("expanded");

const items = computed(
  () =>
    [
      {
        label: "Detalhes da solicitação",
        icon: "i-lucide-file-text",
        slot: "details" as const,
      },
      {
        label: "Detalhes do produto",
        icon: "i-lucide-box",
        slot: "product" as const,
      },
    ] satisfies AccordionItem[]
);

const active = computed<string>({
  get() {
    if (!expandedModel.value) {
      return "";
    }
    return items.value
      .findIndex((item) => item.slot === expandedModel.value)
      .toString();
  },
  set(value: string) {
    if (!value) {
      expandedModel.value = undefined;
      return;
    }
    const index = Number(value);
    expandedModel.value = items.value[index]?.slot;
  },
});
</script>

<template>
  <UAccordion
    v-model="active"
    :items="items"
    :ui="{
      root: 'border border-default rounded-lg',
      trigger: 'p-2 md:p-3 cursor-pointer hover:bg-elevated/50',
      body: 'px-4 pt-3.5',
      content: 'border-t border-default',
    }"
  >
    <template #details-body>
      <div class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-flow-col sm:auto-cols-fr gap-4">
          <LabeledValue
            label="Cliente"
            :value="ticket.client.name"
            icon="i-mdi-account-outline"
          />
          <LabeledValue
            label="Técnico"
            :value="ticket.technician.name"
            icon="i-mdi-account-cog-outline"
          />
        </div>

        <USeparator />

        <LabeledValue
          class="w-full"
          label="Descrição"
          icon="i-pajamas-text-description"
          :ui="{
            root: 'items-start',
            icon: 'size-6',
          }"
        >
          <template #value>
            <p class="text-muted whitespace-pre-line">
              {{ ticket.description }}
            </p>
          </template>
        </LabeledValue>
      </div>
    </template>
    <template #product-body>
      <div class="grid grid-cols-1 sm:grid-flow-col sm:auto-cols-fr gap-4">
        <LabeledValue
          label="Modelo"
          :value="ticket.product.model"
          icon="i-mdi-shape-outline"
        />
        <LabeledValue
          label="Marca"
          :value="ticket.product.brand.name"
          icon="i-ci-building-01"
        />
        <LabeledValue
          label="Categoria"
          :value="ticket.product.category.name"
          icon="i-lucide-tag"
          :ui="{
            icon: 'size-6',
          }"
        />
        <LabeledValue
          label="N. Série"
          :value="ticket.serialNumber"
          icon="i-lucide-barcode"
        />
      </div>
    </template>
  </UAccordion>
</template>
