<script setup lang="tsx">
import {
  type IPaginatedEntity,
  UserRole,
  type IProductEntity,
  type IProductQuery,
} from "@musat/core";
import type { TableColumn } from "@nuxt/ui";

definePageMeta({
  auth: {
    role: UserRole.TECHNICIAN,
  },
});

const { query, refresh } = useApiQuery<
  IPaginatedEntity<IProductEntity>,
  IProductQuery
>("/products");
const { action, setAction, clearAction } = useCrudActions<IProductEntity>();

const columns: TableColumn<IProductEntity>[] = [
  {
    accessorKey: "model",
    header: "Modelo",
  },
  {
    accessorFn: (row) => row.category?.name,
    id: "category",
    header: "Categoria",
  },
  {
    accessorFn: (row) => row.brand?.name,
    id: "brand",
    header: "Marca",
  },
];
</script>

<template>
  <LayoutPage title="Produtos" description="Gestão de produtos">
    <LayoutPageHeaderActions>
      <UButton
        color="primary"
        variant="soft"
        icon="i-lucide-plus"
        class="cursor-pointer"
        aria-label="Cadastrar produto"
        @click="setAction('create')"
      >
        Produto
      </UButton>
    </LayoutPageHeaderActions>

    <ResourceList>
      <template #header>
        <FilterGroup :dirty="query.isDirty.value" @reset="query.reset()">
          <UInput
            v-model.trim="query.modelDebounce.model"
            type="text"
            placeholder="Pesquisar por modelo"
          />

          <CategorySelectMenu v-model="query.model.categoryId" />
          <BrandSelectMenu
            v-model="query.model.brandId"
            :category-id="query.model.categoryId"
          />
        </FilterGroup>
      </template>

      <ResourceTable
        :columns="columns"
        @edit="(resource) => setAction('update', { resource })"
        @delete="(resource) => setAction('delete', { resource })"
      />

      <ResourcePagination />

      <ProductDeleteModal
        v-if="action?.type === 'delete' && action?.resource"
        open
        :product="action?.resource"
        @after:leave="clearAction()"
        @success="refresh()"
      />

      <ProductFormModal
        v-if="action?.type === 'update' || action?.type === 'create'"
        open
        :product="action?.resource"
        @after:leave="clearAction()"
        @success="refresh()"
      />
    </ResourceList>
  </LayoutPage>
</template>
