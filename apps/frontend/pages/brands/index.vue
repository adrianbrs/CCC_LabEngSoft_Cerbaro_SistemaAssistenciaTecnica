<script setup lang="tsx">
import { UButton, UDropdownMenu } from "#components";
import {
  type IPaginatedEntity,
  UserRole,
  type IBrandEntity,
  type IBrandQuery,
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
  brand?: IBrandEntity;
  type: "edit" | "delete" | "create";
} | null>(null);
const query = useApiQuery<IBrandQuery>({
  page: 1,
  limit: 10,
});

const { data, status, error, refresh } = useApi<IPaginatedEntity<IBrandEntity>>(
  "/brands",
  {
    key: "brands",
    params: query.result,
  }
);

const pagination = useApiPagination(query.model, data);

const entityColumns = useEntityColumns();
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
  ...entityColumns,
  {
    id: "actions",
  },
];

const getRowActions = (item: IBrandEntity) => {
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
            brand: item,
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
            brand: item,
            type: "delete",
          };
        },
      },
    ],
  ] satisfies DropdownMenuItem[][];
};

const removeBrand = async (category: IBrandEntity) => {
  if (data.value) {
    const totalItems = Math.max(0, data.value.totalItems - 1);
    const totalPages = Math.ceil(totalItems / data.value.limit);
    const page = Math.max(1, Math.min(data.value.page, totalPages));

    data.value = {
      ...data.value,
      items: data.value.items.filter((item) => item.id !== category.id) ?? [],
      totalItems,
      totalPages,
      page,
      hasNextPage: totalItems > data.value.limit * page,
      hasPrevPage: page > 1,
    };
    query.model.page = page;
    query.model.limit = data.value.limit;
  }
  await refresh();
};

const updateBrand = async (category: IBrandEntity, isNew: boolean) => {
  if (data.value) {
    if (isNew) {
      const totalItems = data.value.totalItems + 1;
      const totalPages = Math.ceil(totalItems / data.value.limit);
      const page = Math.max(1, totalPages);

      data.value = {
        ...data.value,
        totalItems,
        totalPages,
        hasNextPage: totalItems > data.value.limit * page,
        hasPrevPage: page > 1,
        page,
        ...(page === totalPages &&
          data.value.items.length < data.value.limit && {
            items: [...(data.value.items ?? []), category],
          }),
      };
    } else {
      data.value = {
        ...data.value,
        items: data.value.items.map((item) =>
          item.id === category.id ? category : item
        ),
      };
    }

    query.model.page = data.value.page;
    query.model.limit = data.value.limit;
  }
  await refresh();
};
</script>

<template>
  <LayoutPage title="Marcas" description="Gestão de marcas de produtos">
    <LayoutPageHeaderActions>
      <UButton
        color="primary"
        variant="soft"
        icon="i-lucide-plus"
        class="cursor-pointer"
        aria-label="Cadastrar marca"
        @click="
          () => {
            action = {
              type: 'create',
            };
          }
        "
      >
        Marca
      </UButton>
    </LayoutPageHeaderActions>

    <div class="flex items-center justify-between mb-2 gap-4">
      <FilterGroup :dirty="query.isDirty.value" @reset="query.reset">
        <UInput
          v-model.trim="query.modelDebounce.name"
          type="text"
          placeholder="Pesquisar por nome"
        />

        <CategorySelectMenu v-model="query.modelDebounce.categoryId" />
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
          <p class="text-lg">Nenhuma marca encontrada</p>
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

    <BrandDeleteModal
      v-if="action?.type === 'delete' && action?.brand"
      open
      :brand="action?.brand"
      @after:leave="action = null"
      @success="removeBrand"
    />

    <BrandFormModal
      v-if="action?.type === 'edit' || action?.type === 'create'"
      open
      :brand="action?.brand"
      @after:leave="action = null"
      @success="updateBrand"
    />
  </LayoutPage>
</template>
