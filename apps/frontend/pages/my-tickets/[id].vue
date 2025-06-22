<script setup lang="ts">
import type { ITicketEntity } from "@musat/core";

const route = useRoute();

const { data: ticket } = await useApiQuery<ITicketEntity>(
  () => uri`/tickets/${(route.params.id as string | undefined) ?? ""}`
);

useBreadcrumbs(() =>
  ticket.value
    ? [
        {
          label: `Assistência #${ticket.value?.ticketNumber}`,
        },
      ]
    : []
);

const createdAt = useDateFormat(
  () => ticket.value?.createdAt,
  "DD/MM/YYYY HH:mm"
);
</script>

<template>
  <LayoutLoader>
    <LayoutPage
      v-if="ticket"
      :description="`Aberto em ${createdAt}`"
      :ui="{ body: 'space-y-4' }"
    >
      <template #title>
        <h1 class="text-lg md:text-xl font-semibold truncate">
          <span>Assistência #{{ ticket.ticketNumber }}</span>
          <span class="ml-2 text-muted font-normal"
            >({{ ticket.product.model }})</span
          >
        </h1>
      </template>

      <template #header-actions>
        <TicketStatusBadge
          class="hidden sm:block"
          :status="ticket.status"
          size="lg"
        />
      </template>

      <div class="sm:hidden w-full flex items-center justify-center">
        <TicketStatusBadge class="w-full" :status="ticket.status" size="lg" />
      </div>

      <TicketHeader :ticket="ticket" />
    </LayoutPage>
  </LayoutLoader>
</template>
