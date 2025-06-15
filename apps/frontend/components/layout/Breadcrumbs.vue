<script lang="ts">
import type { BreadcrumbItem } from "@nuxt/ui";

declare module "#app" {
  interface PageMeta {
    breadcrumb?: Partial<BreadcrumbItem>;
  }
}
</script>

<script setup lang="ts">
const router = useRouter();
const route = useRoute();

const children = computed<BreadcrumbItem[]>(() =>
  route.matched
    .filter((item) => item.path !== "/" && item.meta.breadcrumb)
    .map((item) => ({
      to: item.path,
      ...(item.meta.breadcrumb as BreadcrumbItem),
    }))
);

const items = computed<BreadcrumbItem[]>(() => {
  if (!children.value.length) {
    return [];
  }

  const home = router.resolve("/");

  return [
    {
      to: home.path,
      ...(home.meta.breadcrumb as BreadcrumbItem),
    },
    ...children.value,
  ];
});
</script>

<template>
  <div v-if="items.length > 0" class="py-3 px-4">
    <UBreadcrumb :items="items" />
  </div>
</template>
