<script
  setup
  lang="ts"
  generic="TEntity extends ICoreEntity, TContext extends UseApiQueryReturn<IPaginatedEntity<TEntity>>"
>
import { UserRole, type ICoreEntity, type IPaginatedEntity } from "@musat/core";
import type { DropdownMenuItem, TableColumn, TableRow } from "@nuxt/ui";
import type { Table } from "@tanstack/vue-table";

const {
  context: contextProp = undefined,
  columns = undefined,
  role = UserRole.ADMIN,
  getRowActions: _getRowActions = undefined,
  onSelect = undefined,
  canEdit = undefined,
  canDelete = undefined,
  onEdit = undefined,
  onDelete = undefined,
} = defineProps<{
  context?: TContext;
  role?: UserRole;
  columns?: TableColumn<TEntity>[];
  canEdit?: (item: TEntity) => boolean;
  canDelete?: (item: TEntity) => boolean;
  getRowActions?: (item: TEntity) => (DropdownMenuItem | DropdownMenuItem[])[];
  onSelect?: (item: TEntity, row: TableRow<TEntity>) => void;
  onEdit?: (item: TEntity) => void;
  onDelete?: (item: TEntity) => void;
}>();

const { hasRole } = useUserSession();
const toast = useToast();
const table = useTemplateRef<{
  tableRef: Ref<HTMLTableElement | undefined, HTMLTableElement | undefined>;
  tableApi: Table<TEntity>;
}>("table");
const slots = useSlots();
const context = useApiQueryCtx<TContext>(contextProp);
const { data, status, error, query, refresh } = context;
const dfns = useDateFns();

const computedColumns = computed<TableColumn<TEntity>[]>(() => [
  ...(columns ?? []),
  {
    accessorFn: (row) => dfns.formatDateTime(row.createdAt),
    header: "Criado em",
  },
  {
    accessorFn: (row) => dfns.formatDateTime(row.updatedAt),
    header: "Atualizado em",
  },
  {
    id: "actions",
  },
]);

const getRowActions = (item: TEntity) => {
  const items: DropdownMenuItem[][] = [
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
  ];

  if (hasRole(role)) {
    const managementActions: DropdownMenuItem[] = [];

    if (onEdit && (!canEdit || canEdit(item))) {
      managementActions.push({
        label: "Editar",
        class: "cursor-pointer",
        icon: "i-lucide-edit",
        onClick: () => {
          onEdit!(item);
        },
      });
    }

    if (onDelete && (!canDelete || canDelete(item))) {
      managementActions.push({
        label: "Excluir",
        color: "error",
        class: "cursor-pointer",
        icon: "i-lucide-trash-2",
        onClick: () => {
          onDelete!(item);
        },
      });
    }

    items.push(managementActions);
  }

  if (typeof _getRowActions === "function") {
    const actions = _getRowActions(item);
    let group = 0;
    actions.forEach((action) => {
      if (Array.isArray(action)) {
        if (action.length) {
          items.splice(group, 0, action);
        }
        group++;
      } else {
        items[group] ??= [];
        items[group].push(action);
      }
    });
  }

  return items.filter((group) => group.length > 0);
};

const slottedColumns = computed(() => {
  return (
    table.value?.tableApi
      .getAllColumns()
      .filter((col) => !!slots[`${col.id}-cell`]) ?? []
  );
});
</script>

<template>
  <UTable
    ref="table"
    class="border border-default rounded-md"
    :data="data?.items"
    :column-pinning="{
      right: ['actions'],
    }"
    :columns="computedColumns"
    :loading="status === 'pending'"
    :ui="{
      tr: onSelect ? 'cursor-pointer' : undefined,
    }"
    sticky
    v-bind="{
      ...(onSelect && {
        onSelect: (row: TableRow<TEntity>) => {
          onSelect!(row.original, row)
        }
      })
    }"
  >
    <template
      v-for="col in slottedColumns"
      :key="col.id"
      #[`${col.id}-cell`]="ctx"
    >
      <slot :name="`${col.id}-cell`" v-bind="ctx" />
    </template>

    <template #empty>
      <div v-if="error" class="p-6">
        <slot name="error" :status="status" :refresh="refresh" :error="error">
          <EmptyState
            title="Oops! Algo deu errado"
            description="Não foi possível carregar, tente novamente mais tarde."
            icon="i-lucide-alert-triangle"
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
        </slot>
      </div>
      <div v-else class="px-6 flex flex-col items-center justify-center gap-4">
        <slot name="empty" :status="status">
          <EmptyState
            v-if="query.isDirty.value"
            icon="i-fluent-box-search-24-regular"
            title="Não encontramos nada"
            description="Tente limpar os filtros ou redefinir a pesquisa."
            :actions="[
              {
                label: 'Limpar filtros',
                icon: 'i-lucide-filter-x',
                variant: 'outline',
                size: 'md',
                color: 'neutral',
                class: 'cursor-pointer',
                onClick: () => query.reset(),
              },
            ]"
          />

          <EmptyState
            v-else
            icon="i-system-uicons-box-open"
            title="Não há nada por aqui"
            description="Parece que não há nada para mostrar no momento."
            :actions="[
              {
                label: 'Atualizar',
                icon: 'i-lucide-refresh-ccw',
                variant: 'link',
                size: 'md',
                color: 'neutral',
                class: 'cursor-pointer',
                loading: status === 'pending',
                onClick: () => refresh(),
              },
            ]"
          />
        </slot>
      </div>
    </template>

    <template #actions-cell="ctx">
      <slot name="actions" v-bind="ctx">
        <div class="flex items-center gap-2">
          <slot name="actions-leading" v-bind="ctx" />

          <UDropdownMenu
            :content="{
              align: 'end',
            }"
            :items="getRowActions(ctx.row.original)"
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

          <slot name="actions-trailing" v-bind="ctx" />
        </div>
      </slot>
    </template>
  </UTable>
</template>
