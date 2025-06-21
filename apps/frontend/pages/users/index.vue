<script setup lang="tsx">
import { UserRoleBadge } from "#components";
import {
  UserRole,
  type IPaginatedEntity,
  type IUserEntity,
  type IUserQuery,
} from "@musat/core";
import type { TableColumn } from "@nuxt/ui";

definePageMeta({
  auth: {
    role: UserRole.ADMIN,
  },
});

const { user } = useUserSession(true);
const { query, refresh } = useApiQuery<
  IPaginatedEntity<IUserEntity>,
  IUserQuery
>("/users");
const { action, setAction, clearAction } = useCrudActions<IUserEntity>();

const columns: TableColumn<IUserEntity>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Nome",
  },
  {
    accessorKey: "cpf",
    header: "CPF",
  },
  {
    accessorKey: "email",
    header: "E-mail",
  },
  {
    accessorKey: "phone",
    header: "Telefone",
  },
  {
    accessorKey: "role",
    header: "Cargo",
    cell: ({ row }) => h(UserRoleBadge, { role: row.original.role }),
  },
];
</script>

<template>
  <LayoutPage title="Usuários" description="Administração de usuários">
    <ResourceList>
      <template #header>
        <FilterGroup :dirty="query.isDirty.value" @reset="query.reset()">
          <UInput
            v-model.trim="query.modelDebounce.name"
            type="text"
            placeholder="Pesquisar por nome"
          />

          <UserRoleSelectMenu
            v-model="query.model.role"
            placeholder="Filtrar por cargo"
          />
        </FilterGroup>
      </template>

      <ResourceTable
        :columns="columns"
        :can-edit="(item) => item.id !== user.id"
        @edit="(resource) => setAction('update', { resource })"
      >
        <template #name-cell="{ cell, renderValue }">
          <div class="flex items-center gap-2">
            <UAvatar
              icon="i-lucide-user"
              :alt="cell.row.original.name"
              size="sm"
            />

            <p class="text-md">{{ renderValue() }}</p>

            <UBadge
              v-if="cell.row.original.id === user.id"
              variant="soft"
              color="primary"
              size="sm"
              class="rounded-full"
            >
              Você
            </UBadge>
          </div>
        </template>
      </ResourceTable>

      <ResourcePagination />

      <UserFormModal
        v-if="action?.type === 'update'"
        open
        :user="action.resource"
        @after:leave="clearAction()"
        @success="refresh()"
      />
    </ResourceList>
  </LayoutPage>
</template>
