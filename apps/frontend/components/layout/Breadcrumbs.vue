<script setup lang="ts">
import type { BreadcrumbItem } from "@nuxt/ui";

const router = useRouter();
const route = useRoute();

const children = computed<BreadcrumbItem[]>(() =>
  route.matched
    .filter((item) => item.path !== "/" && item.meta.nav)
    .map((item) => ({
      label: item.meta.nav?.label,
      icon: item.meta.nav?.icon,
      to: item.meta.nav?.to ?? item.path,
    }))
);

const items = computed<BreadcrumbItem[]>(() => {
  if (!children.value.length) {
    return [];
  }

  const home = router.resolve("/");

  return [
    {
      label: home.meta.nav?.label,
      icon: home.meta.nav?.icon,
      to: home.meta.nav?.to ?? home.path,
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
