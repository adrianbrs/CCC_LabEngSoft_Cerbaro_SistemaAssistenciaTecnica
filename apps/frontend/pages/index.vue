<script setup lang="ts">
import type {
  IPaginatedEntity,
  ITicketEntity,
  ITicketQuery,
  ITicketResponse,
} from "@musat/core";

const router = useRouter();
const showCreateTicketModal = ref(false);

const tickets = useApiQuery<IPaginatedEntity<ITicketResponse>, ITicketQuery>(
  "/tickets/user",
  {
    lazy: true,
    query: {
      limit: 5,
    },
  }
);

const onCreateTicket = (ticket: ITicketEntity) => {
  router.push(uri`/my-tickets/${ticket.id}`);
};
</script>

<template>
  <LayoutPage>
    <div class="w-full mb-4">
      <UButton
        variant="soft"
        color="primary"
        icon="i-bi-tools"
        class="cursor-pointer w-full py-4"
        :ui="{
          base: 'justify-center',
          leadingIcon: 'mr-2',
        }"
        @click="showCreateTicketModal = true"
      >
        Solicitar assistência técnica
      </UButton>
    </div>

    <UCard
      class="w-full"
      :ui="{
        footer:
          'flex flex-col gap-4 items-center sm:flex-row sm:justify-between',
      }"
    >
      <template #header>
        <h2>Solicitações recentes</h2>
      </template>

      <TicketClientTable :context="tickets" />

      <template #footer>
        <p class="text-muted text-sm">
          Mostrando {{ tickets.data.value?.items.length ?? 0 }} de
          {{ tickets.data.value?.totalItems ?? 0 }} solicitações
        </p>

        <UButton
          variant="link"
          color="primary"
          to="/my-tickets"
          class="cursor-pointer"
          trailing-icon="i-lucide-chevron-right"
        >
          Ver minhas solicitações
        </UButton>
      </template>
    </UCard>

    <TicketCreateFormModal
      v-model:open="showCreateTicketModal"
      @success="onCreateTicket"
    />
  </LayoutPage>
</template>
