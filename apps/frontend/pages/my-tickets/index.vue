<script setup lang="tsx">
import { TicketStatusBadge } from "#components";
import type {
  IPaginatedEntity,
  ITicketEntity,
  ITicketQuery,
} from "@musat/core";
import type { TableColumn } from "@nuxt/ui";

definePageMeta({
  name: "my-tickets",
});

const router = useRouter();
const { query, refresh } = useApiQuery<
  IPaginatedEntity<ITicketEntity>,
  ITicketQuery
>("/tickets/user");
const { action, setAction, clearAction } = useCrudActions();
const dfns = useDateFns();

const columns: TableColumn<ITicketEntity>[] = [
  {
    accessorKey: "ticketNumber",
    header: "#",
  },
  {
    accessorFn: (row) => row.product.model,
    header: "Produto",
  },
  {
    accessorFn: (row) => row.product.brand.name,
    header: "Marca",
  },
  {
    accessorKey: "serialNumber",
    header: "N. Série",
  },
  {
    accessorFn: (row) => row.product.category.name,
    header: "Categoria",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <TicketStatusBadge status={row.original.status} size="md" />
    ),
  },
  {
    accessorFn: (row) => row.technician.name,
    header: "Técnico",
  },
  {
    accessorFn: (row) =>
      row.closedAt ? dfns.formatDateTime(row.closedAt) : "--",
    header: "Fechado em",
  },
];

const onCreate = (ticket: ITicketEntity) => {
  refresh();
  router.push(uri`/my-tickets/${ticket.id}`);
};
</script>

<template>
  <LayoutPage
    title="Minhas assistências"
    description="Veja todas as assistências que você solicitou."
  >
    <template #header-actions>
      <UButton
        color="primary"
        variant="soft"
        icon="i-lucide-plus"
        class="cursor-pointer"
        aria-label="Cadastrar categoria"
        @click="setAction('create')"
      >
        Solicitar assistência
      </UButton>
    </template>

    <ResourceList>
      <template #header>
        <FilterGroup :dirty="query.isDirty.value" @reset="query.reset()">
          <UInput
            v-model.trim="query.modelDebounce.serialNumber"
            type="text"
            placeholder="Pesquisar por N. Série"
          />

          <TicketStatusSelectMenu
            v-model="query.modelDebounce.status"
            placeholder="Filtrar por status"
          />

          <CategorySelectMenu
            v-model="query.modelDebounce.categoryId"
            placeholder="Filtrar por categoria"
          />

          <BrandSelectMenu
            v-model="query.modelDebounce.brandId"
            placeholder="Filtrar por marca"
          />

          <ProductSelectMenu
            v-model="query.modelDebounce.productId"
            placeholder="Filtrar por produto"
          />
        </FilterGroup>
      </template>

      <ResourceTable
        :columns="columns"
        @select="router.push(uri`/my-tickets/${$event.id}`)"
      />

      <ResourcePagination />

      <TicketCreateFormModal
        v-if="action?.type === 'create'"
        open
        @after:leave="clearAction()"
        @success="onCreate"
      />
    </ResourceList>
  </LayoutPage>
</template>
