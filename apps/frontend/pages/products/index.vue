<script setup lang="tsx">
import { UButton, UDropdownMenu } from "#components";
import {
  type IPaginatedEntity,
  UserRole,
  type IProductEntity,
  type IProductQuery,
} from "@musat/core";
import type { DropdownMenuItem, TableColumn } from "@nuxt/ui";
import CategorySelectMenu from "~/components/category/CategorySelectMenu.vue";

definePageMeta({
  auth: {
    role: UserRole.ADMIN,
  },
});

const toast = useToast();
const action = ref<{
  product?: IProductEntity;
  type: "edit" | "delete" | "create";
} | null>(null);
const query = useApiQuery<IProductQuery>({
  page: 1,
  limit: 10,
});

const { data, status, error, refresh } = useApi<
  IPaginatedEntity<IProductEntity>
>("/products", {
  key: "products",
  params: query.result,
});

const pagination = useApiPagination(query.model, data);

const entityColumns = useEntityColumns();
const columns: TableColumn<IProductEntity>[] = [
  {
    accessorKey: "model",
    header: "Nome",
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
  ...entityColumns,
  {
    id: "actions",
  },
];

const getRowActions = (item: IProductEntity) => {
  return [
    [
      {
        label: "Copiar ID",
        icon: "i-lucide-copy",
        class: "cursor-pointer",
        onSelect: () => {
          navigator.clipboard.writeText(item.id);
          toast.add({
            title: "ID copiado para a área de transferência",
            color: "success",
            icon: "i-lucide-circle-check",
          });
        },
      },
    ],
    [
      {
        label: "Editar",
        class: "cursor-pointer",
        icon: "i-lucide-edit",
        onClick: () => {
          action.value = {
            product: item,
            type: "edit",
          };
        },
      },
      {
        label: "Excluir",
        color: "error",
        class: "cursor-pointer",
        icon: "i-lucide-trash-2",
        onClick: () => {
          action.value = {
            product: item,
            type: "delete",
          };
        },
      },
    ],
  ] satisfies DropdownMenuItem[][];
};
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
        @click="
          () => {
            action = {
              type: 'create',
            };
          }
        "
      >
        Produto
      </UButton>
    </LayoutPageHeaderActions>

    <div class="flex items-center justify-between mb-2 gap-4">
      <FilterGroup :dirty="query.isDirty.value" @reset="query.reset">
        <UInput
          v-model.trim="query.modelDebounce.model"
          type="text"
          placeholder="Pesquisar por modelo"
        />

        <CategorySelectMenu v-model="query.model.categoryId" />
        <BrandSelectMenu
          v-model="query.model.brandId"
          :category-id="query.result.value.categoryId"
        />
      </FilterGroup>

      <UButton
        variant="soft"
        color="neutral"
        icon="i-lucide-refresh-ccw"
        class="cursor-pointer"
        :loading="status === 'pending'"
        @click="() => refresh()"
      >
        Atualizar
      </UButton>
    </div>

    <UTable
      class="border border-default rounded-md"
      :data="data?.items"
      :column-pinning="{
        right: ['actions'],
      }"
      :columns="columns"
      :loading="status === 'pending'"
      sticky
    >
      <template #empty>
        <div v-if="error" class="text-left px-6">
          <UAlert
            title="Oops!"
            description="Não foi possível carregar, tente novamente mais tarde."
            icon="i-lucide-alert-triangle"
            variant="subtle"
            color="error"
            orientation="vertical"
            :actions="[
              {
                label: 'Tentar novamente',
                variant: 'outline',
                size: 'md',
                color: 'neutral',
                class: 'cursor-pointer',
                loading: status === 'pending',
                icon: 'i-lucide-refresh-ccw',
                onClick: () => refresh(),
              },
            ]"
          />
        </div>
        <div
          v-else
          class="px-6 flex flex-col items-center justify-center gap-4"
        >
          <UIcon name="i-system-uicons-box-open" size="54" />
          <p class="text-lg">Nenhum produto encontrado</p>
        </div>
      </template>

      <template #actions-cell="{ row }">
        <div class="text-right">
          <UDropdownMenu
            :content="{
              align: 'end',
            }"
            :items="getRowActions(row.original)"
            aria-label="Ações"
          >
            <UButton
              icon="i-lucide-ellipsis-vertical"
              color="neutral"
              variant="ghost"
              class="cursor-pointer"
              aria-label="Ações"
            />
          </UDropdownMenu>
        </div>
      </template>
    </UTable>

    <div class="flex justify-center border-t border-default pt-4">
      <UPagination v-bind="pagination.props.value" />
    </div>

    <ProductDeleteModal
      v-if="action?.type === 'delete' && action?.product"
      open
      :product="action?.product"
      @after:leave="action = null"
      @success="refresh()"
    />

    <ProductFormModal
      v-if="action?.type === 'edit' || action?.type === 'create'"
      open
      :product="action?.product"
      @after:leave="action = null"
      @success="refresh()"
    />
  </LayoutPage>
</template>
