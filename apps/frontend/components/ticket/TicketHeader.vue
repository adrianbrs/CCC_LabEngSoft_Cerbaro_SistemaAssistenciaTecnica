<script setup lang="ts">
import type { ITicketEntity } from "@musat/core";
import type { AccordionItem } from "@nuxt/ui";

defineProps<{
  ticket: ITicketEntity;
}>();

const expandedModel = defineModel<"description" | "product">("expanded");

const items = [
  {
    label: "Descrição",
    icon: "i-pajamas-text-description",
    slot: "description" as const,
  },
  {
    label: "Detalhes do produto",
    icon: "i-lucide-box",
    slot: "product" as const,
  },
] satisfies AccordionItem[];

const active = computed<string>({
  get() {
    if (!expandedModel.value) {
      return "";
    }
    return items
      .findIndex((item) => item.slot === expandedModel.value)
      .toString();
  },
  set(value: string) {
    if (!value) {
      expandedModel.value = undefined;
      return;
    }
    const index = Number(value);
    expandedModel.value = items[index]?.slot;
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
    <template #description-body>
      <p class="whitespace-pre-line">{{ ticket.description }}</p>
    </template>
  </UAccordion>
</template>
