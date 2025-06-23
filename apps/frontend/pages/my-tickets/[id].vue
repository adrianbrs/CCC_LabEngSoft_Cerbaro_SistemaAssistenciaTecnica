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
          label: `Solicitação #${ticket.value?.ticketNumber}`,
        },
      ]
    : []
);

const isDesktop = useMediaQuery("(width >= 48rem)");
const [DefineTicketStatus, UseTicketStatus] = createReusableTemplate();
</script>

<template>
  <LayoutLoader>
    <DefineTicketStatus>
      <TicketStatusBadge
        v-if="ticket"
        :status="ticket.status"
        size="lg"
        class="w-full"
      />
    </DefineTicketStatus>

    <LayoutPage
      v-if="ticket"
      :description="`Aberto em ${$dfns.formatDateTime(ticket.createdAt)}`"
      :ui="{ body: 'space-y-4' }"
    >
      <template #title>
        <div class="flex items-center min-w-0 gap-2 md:gap-3">
          <h1 class="text-lg md:text-xl font-semibold truncate">
            Solicitação #{{ ticket.ticketNumber }}
          </h1>

          <USeparator class="h-4" orientation="vertical" />

          <h2 class="text-sm md:text-base text-muted font-normal truncate">
            {{ ticket.product.model }}
          </h2>
        </div>
      </template>

      <template #header-actions>
        <UseTicketStatus v-if="isDesktop" />
      </template>

      <UseTicketStatus v-if="!isDesktop" class="w-full" />
      <TicketHeader :ticket="ticket" />
    </LayoutPage>
  </LayoutLoader>
</template>
