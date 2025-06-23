<script setup lang="tsx">
import { UButton } from "#components";
import {
  type IPaginatedEntity,
  UserRole,
  type ICategoryEntity,
  type ICategoryQuery,
} from "@musat/core";
import type { TableColumn } from "@nuxt/ui";

definePageMeta({
  auth: {
    role: UserRole.TECHNICIAN,
  },
});

const { query, refresh } = useApiQuery<
  IPaginatedEntity<ICategoryEntity>,
  ICategoryQuery
>("/categories");
const { action, setAction, clearAction } = useCrudActions<ICategoryEntity>();

const columns: TableColumn<ICategoryEntity>[] = [
  {
    accessorKey: "name",
    header: "Nome",
  },
];
</script>

<template>
  <LayoutPage title="Categorias" description="Gestão de categorias de produtos">
    <template #header-actions>
      <AccountRestrict :role="UserRole.ADMIN">
        <UButton
          color="primary"
          variant="soft"
          icon="i-lucide-plus"
          class="cursor-pointer"
          aria-label="Cadastrar categoria"
          @click="setAction('create')"
        >
          Categoria
        </UButton>
      </AccountRestrict>
    </template>

    <ResourceList>
      <template #header>
        <FilterGroup :dirty="query.isDirty.value" @reset="query.reset()">
          <UInput
            v-model.trim="query.modelDebounce.name"
            type="text"
            placeholder="Pesquisar por nome"
            class="w-full md:w-xs"
          />
        </FilterGroup>
      </template>

      <ResourceTable
        :columns="columns"
        @edit="(resource) => setAction('update', { resource })"
        @delete="(resource) => setAction('delete', { resource })"
      />

      <ResourcePagination />

      <CategoryDeleteModal
        v-if="action?.type === 'delete' && action?.resource"
        open
        :category="action?.resource"
        @after:leave="clearAction()"
        @success="refresh()"
      />

      <CategoryFormModal
        v-if="action?.type === 'update' || action?.type === 'create'"
        open
        :category="action?.resource"
        @after:leave="clearAction()"
        @success="refresh()"
      />
    </ResourceList>
  </LayoutPage>
</template>
