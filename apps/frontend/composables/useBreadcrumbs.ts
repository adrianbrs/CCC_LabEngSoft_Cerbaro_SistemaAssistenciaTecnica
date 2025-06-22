import type { BreadcrumbItem } from "@nuxt/ui";
import type { InjectionKey } from "vue";

interface BreadcrumbCtx {
  tree: Ref<BreadcrumbItem[][]>;
  breadcrumbs: ComputedRef<BreadcrumbItem[]>;
}

const BREADCRUMB_CTX = Symbol("BREADCRUMB_CTX") as InjectionKey<BreadcrumbCtx>;

export interface UseBreadcrumbsReturn {
  breadcrumbs: ComputedRef<BreadcrumbItem[]>;
}

export function useBreadcrumbs(
  breadcrumbs?: MaybeRefOrGetter<BreadcrumbItem[]>
): UseBreadcrumbsReturn {
  let ctx = inject(BREADCRUMB_CTX, null);

  if (!ctx) {
    const tree = ref<BreadcrumbItem[][]>([]);
    const flattened = computed(() => tree.value.flat());

    ctx = {
      tree,
      breadcrumbs: flattened,
    } as BreadcrumbCtx;

    provide(BREADCRUMB_CTX, ctx);
  }

  const index = ctx.tree.value.length;

  watch(
    () => toValue(breadcrumbs),
    (newBreadcrumbs) => {
      ctx.tree.value[index] = newBreadcrumbs || [];
    },
    { immediate: true }
  );

  onUnmounted(() => {
    ctx.tree.value[index] = [];
  });

  return {
    breadcrumbs: ctx.breadcrumbs,
  };
}
