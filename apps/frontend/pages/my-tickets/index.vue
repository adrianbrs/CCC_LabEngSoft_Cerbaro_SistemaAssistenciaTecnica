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
const { query } = useApiQuery<IPaginatedEntity<ITicketEntity>, ITicketQuery>(
  "/tickets/user"
);

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
];
</script>

<template>
  <LayoutPage
    title="Minhas assistências"
    description="Veja todas as assistências que você solicitou."
  >
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
        </FilterGroup>
      </template>

      <ResourceTable
        :columns="columns"
        @select="router.push(uri`/my-tickets/${$event.id}`)"
      />

      <ResourcePagination />
    </ResourceList>
  </LayoutPage>
</template>
