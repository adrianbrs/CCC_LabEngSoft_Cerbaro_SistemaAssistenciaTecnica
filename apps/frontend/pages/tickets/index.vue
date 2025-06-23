<script setup lang="tsx">
import { TicketStatusBadge } from "#components";
import {
  UserRole,
  type IPaginatedEntity,
  type ITicketEntity,
  type ITicketQuery,
} from "@musat/core";
import type { TableColumn } from "@nuxt/ui";

definePageMeta({
  name: "tickets",
  auth: {
    role: UserRole.TECHNICIAN,
  },
});

const router = useRouter();
const { hasRole } = useUserSession(true);
const isAdmin = computed(() => hasRole(UserRole.ADMIN));
const { query } = useApiQuery<IPaginatedEntity<ITicketEntity>, ITicketQuery>(
  "/tickets"
);

const columns = computed<TableColumn<ITicketEntity>[]>(() => [
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
    accessorFn: (row) => row.client.name,
    header: "Cliente",
  },
  ...(isAdmin.value
    ? [
        {
          accessorFn: (row: ITicketEntity) => row.technician.name,
          header: "Técnico",
        },
      ]
    : []),
]);
</script>

<template>
  <LayoutPage
    :title="isAdmin ? `Solicitações` : `Solicitações assignadas`"
    :description="
      isAdmin
        ? `Gerencie todas as solicitações em andamento e/ou finalizadas.`
        : `Gerencie todas as solicitações assignadas a você.`
    "
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
        @select="router.push(uri`/tickets/${$event.id}`)"
      />

      <ResourcePagination />
    </ResourceList>
  </LayoutPage>
</template>
