<script setup lang="tsx">
import { TicketStatusBadge } from "#components";
import type {
  IPaginatedEntity,
  ITicketEntity,
  ITicketResponse,
} from "@musat/core";
import type { TableColumn } from "@nuxt/ui";

const props = defineProps<{
  context?: UseApiQueryReturn<IPaginatedEntity<ITicketResponse>>;
}>();

const context = useApiQueryCtx(props.context);
const dfns = useDateFns();
const router = useRouter();
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
</script>

<template>
  <ResourceTable
    :context="context"
    :columns="columns"
    @select="router.push(uri`/my-tickets/${$event.id}`)"
  />
</template>
