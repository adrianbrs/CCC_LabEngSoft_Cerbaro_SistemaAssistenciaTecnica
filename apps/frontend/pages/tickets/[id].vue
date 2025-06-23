<script setup lang="ts">
import type { ITicketEntity } from "@musat/core";
import TicketUpdateFormModal from "~/components/ticket/TicketUpdateFormModal.vue";

const route = useRoute();

const { data: ticket, refresh } = await useApiQuery<ITicketEntity>(
  () => uri`/tickets/${(route.params.id as string | undefined) ?? ""}`
);
const { action, setAction, clearAction } = useCrudActions<ITicketEntity>();

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

        <UButton
          icon="i-lucide-edit"
          variant="link"
          class="cursor-pointer"
          @click="setAction('update', { resource: ticket })"
        >
          Alterar
        </UButton>
      </template>

      <UseTicketStatus v-if="!isDesktop" class="w-full" />
      <TicketHeader :ticket="ticket" />

      <TicketUpdateFormModal
        :open="action?.type === 'update'"
        :ticket="ticket"
        @update:open="!$event && clearAction()"
        @success="refresh()"
      />
    </LayoutPage>
  </LayoutLoader>
</template>
