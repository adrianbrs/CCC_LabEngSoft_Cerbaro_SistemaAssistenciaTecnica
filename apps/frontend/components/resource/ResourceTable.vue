<script
  setup
  lang="ts"
  generic="TEntity extends ICoreEntity, TContext extends UseApiQueryReturn<IPaginatedEntity<TEntity>>"
>
import { UserRole, type ICoreEntity, type IPaginatedEntity } from "@musat/core";
import type { DropdownMenuItem, TableColumn } from "@nuxt/ui";
import type { Table } from "@tanstack/vue-table";

const {
  context: contextProp = undefined,
  onEdit = undefined,
  onDelete = undefined,
  actions = undefined,
  columns = undefined,
  role = UserRole.ADMIN,
} = defineProps<{
  context?: TContext;
  actions?: (DropdownMenuItem | DropdownMenuItem[])[];
  role?: UserRole;
  columns?: TableColumn<TEntity>[];
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
const { data, status, error, refresh } = context;

const computedColumns = computed<TableColumn<TEntity>[]>(() => [
  ...(columns ?? []),
  {
    accessorKey: "createdAt",
    header: "Criado em",
  },
  {
    accessorKey: "updatedAt",
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

    if (onEdit) {
      managementActions.push({
        label: "Editar",
        class: "cursor-pointer",
        icon: "i-lucide-edit",
        onClick: () => {
          onEdit!(item);
        },
      });
    }

    if (onDelete) {
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

  if (actions?.length) {
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
    sticky
  >
    <template
      v-for="col in slottedColumns"
      :key="col.id"
      #[`${col.id}-cell`]="ctx"
    >
      <slot :name="`${col.id}-cell`" v-bind="ctx" />
    </template>

    <template #empty>
      <div v-if="error" class="text-left px-6">
        <slot name="error" :status="status" :refresh="refresh" :error="error">
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
        </slot>
      </div>
      <div v-else class="px-6 flex flex-col items-center justify-center gap-4">
        <slot name="empty" :status="status">
          <UIcon name="i-system-uicons-box-open" size="54" />
          <p class="text-lg">Não encontramos nada</p>
        </slot>
      </div>
    </template>

    <template #actions-cell="ctx">
      <slot name="actions" v-bind="ctx">
        <div class="text-right">
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
        </div>
      </slot>
    </template>
  </UTable>
</template>
