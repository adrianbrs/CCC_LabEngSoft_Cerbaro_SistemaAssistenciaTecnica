<script setup lang="tsx">
import {
  UserRole,
  type IBrandEntity,
  type IBrandQuery,
  type IPaginatedEntity,
} from "@musat/core";
import type { TableColumn } from "@nuxt/ui";

definePageMeta({
  auth: {
    role: UserRole.TECHNICIAN,
  },
});

const { query, refresh } = useApiQuery<
  IPaginatedEntity<IBrandEntity>,
  IBrandQuery
>("/brands");
const { action, setAction, clearAction } = useCrudActions<IBrandEntity>();

const columns: TableColumn<IBrandEntity>[] = [
  {
    accessorKey: "name",
    header: "Nome",
  },
  {
    accessorKey: "email",
    header: "E-mail",
  },
  {
    accessorKey: "phone",
    header: "Telefone",
  },
];
</script>

<template>
  <LayoutPage title="Marcas" description="Gestão de marcas de produtos">
    <LayoutPageHeaderActions>
      <AccountRestrict :role="UserRole.ADMIN">
        <UButton
          color="primary"
          variant="soft"
          icon="i-lucide-plus"
          class="cursor-pointer"
          aria-label="Cadastrar marca"
          @click="setAction('create')"
        >
          Marca
        </UButton>
      </AccountRestrict>
    </LayoutPageHeaderActions>

    <ResourceList>
      <template #header>
        <FilterGroup :dirty="query.isDirty.value" @reset="query.reset()">
          <UInput
            v-model.trim="query.modelDebounce.name"
            type="text"
            placeholder="Pesquisar por nome"
          />

          <CategorySelectMenu v-model="query.modelDebounce.categoryId" />
        </FilterGroup>
      </template>

      <ResourceTable
        :columns="columns"
        @edit="(resource) => setAction('update', { resource })"
        @delete="(resource) => setAction('delete', { resource })"
      />

      <ResourcePagination />

      <BrandDeleteModal
        v-if="action?.type === 'delete' && action?.resource"
        open
        :brand="action?.resource"
        @after:leave="clearAction()"
        @success="refresh()"
      />

      <BrandFormModal
        v-if="action?.type === 'update' || action?.type === 'create'"
        open
        :brand="action?.resource"
        @after:leave="clearAction()"
        @success="refresh()"
      />
    </ResourceList>
  </LayoutPage>
</template>
