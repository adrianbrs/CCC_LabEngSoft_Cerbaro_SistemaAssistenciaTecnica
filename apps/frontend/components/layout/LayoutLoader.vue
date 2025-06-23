<script setup lang="ts">
import type { EmptyStateProps } from "../EmptyState.vue";
import { FetchError } from "ofetch";
import { H3Error } from "h3";

const props = withDefaults(
  defineProps<{
    loading?: boolean;
    error?: Error;
    empty?: boolean;
    hasFilters?: boolean;
    onResetFilters?: () => void;
    onRefresh?: () => void;
  }>(),
  {
    loading: undefined,
    error: undefined,
    empty: undefined,
    hasFilters: undefined,
    onResetFilters: undefined,
    onRefresh: undefined,
  }
);

const ctx = useApiQueryCtx(false);

const error = computed(() => props.error ?? ctx?.error.value);
const empty = computed(() => props.empty ?? (ctx?.data.value ?? null) === null);
const loading = computed(
  () => props.loading ?? (ctx?.pending.value && empty.value)
);
const hasFilters = computed(() => props.hasFilters ?? ctx?.query.isDirty.value);
const resetFilters = computed(() => props.onResetFilters ?? ctx?.query.reset);
const refresh = computed(() => props.onRefresh ?? ctx?.refresh);

const errorProps = computed<EmptyStateProps | null>(() => {
  const err = error.value;

  if (err instanceof FetchError || err instanceof H3Error) {
    const status = err.statusCode;

    if (status === 400) {
      return {
        title: "Solicitação inválida",
        description:
          "Por favor, verifique os dados informados e tente novamente.\nSe o problema persistir, entre em contato com o suporte.",
        icon: "i-lucide-file-question-mark",
      };
    } else if (status === 404) {
      return {
        title: "Recurso não encontrado",
        description: "Não foi possível encontrar o recurso solicitado.",
        icon: "i-fluent-box-search-24-regular",
      };
    } else if (status === 500) {
      return {
        title: "Erro interno do servidor",
        description:
          "Ocorreu um erro no servidor. Por favor, tente novamente mais tarde.",
        icon: "i-lucide-server-crash",
      };
    }
  }

  return {
    title: "Oops! Não foi possível carregar a página",
    description:
      "Tente novamente mais tarde ou entre em contato com o suporte.",
  };
});
</script>

<template>
  <template v-if="loading || error || empty">
    <div
      class="w-full h-full flex flex-col items-center justify-center min-h-(--ui-content-height) p-4 md:p-6 lg:p-8"
    >
      <template v-if="loading">
        <slot name="loading">
          <EmptyState>
            <template #asset>
              <LoadingIndicator class="size-10 md:size-12 text-primary" />
            </template>

            <template #title>
              <h3 class="sr-only">Carregando...</h3>
            </template>
          </EmptyState>
        </slot>
      </template>
      <template v-else-if="error">
        <slot name="error" :error="error">
          <EmptyState
            icon="i-lucide-alert-triangle"
            :actions="[
              {
                label: 'Voltar ao início',
                icon: 'i-lucide-home',
                to: '/',
              },
            ]"
            v-bind="errorProps"
          />
        </slot>
      </template>
      <template v-else>
        <slot name="empty" :has-filters="hasFilters">
          <EmptyState
            v-if="hasFilters"
            icon="i-fluent-box-search-24-regular"
            title="Não encontramos nada"
            description="Tente limpar os filtros ou redefinir a pesquisa."
            :actions="
              resetFilters
                ? [
                    {
                      label: 'Limpar filtros',
                      icon: 'i-lucide-filter-x',
                      variant: 'outline',
                      size: 'md',
                      color: 'neutral',
                      class: 'cursor-pointer',
                      onClick: () => resetFilters?.(),
                    },
                  ]
                : undefined
            "
          />

          <EmptyState
            v-else
            icon="i-system-uicons-box-open"
            title="Não há nada por aqui"
            description="Parece que não há nada para mostrar no momento."
            :actions="
              refresh
                ? [
                    {
                      label: 'Tentar novamente',
                      icon: 'i-lucide-refresh-ccw',
                      variant: 'outline',
                      size: 'md',
                      color: 'neutral',
                      class: 'cursor-pointer',
                      loading: ctx?.status.value === 'pending',
                      onClick: () => refresh?.(),
                    },
                  ]
                : undefined
            "
          />
        </slot>
      </template>
    </div>
  </template>
  <template v-else>
    <slot />
  </template>
</template>
