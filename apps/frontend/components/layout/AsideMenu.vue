<script lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";
</script>

<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const open = defineModel<boolean>("open");
const { hasRole } = useUserSession();
const isDesktop = useMediaQuery("(width >= 48rem)");
const [DefineNavTemplate, UseNavTemplate] = createReusableTemplate();

watch(
  () => route.path,
  () => {
    if (open.value) {
      open.value = false;
    }
  }
);

const items = computed<NavigationMenuItem[][]>(() => [
  [
    {
      to: "/",
      label: "Início",
      icon: "i-lucide-home",
    },
  ],
  [
    {
      label: "Administração",
      type: "label",
    },
    {
      label: "Categorias",
      icon: "i-lucide-tag",
      to: "/categories",
    },
    {
      label: "Marcas",
      icon: "i-ci-building-01",
      to: "/brands",
    },
  ],
]);

const filterItems = <T extends NavigationMenuItem>(items: T[]): T[] => {
  const result = items
    .map((item) => ({
      ...item,
      children: item.children ? filterItems(item.children) : [],
    }))
    .filter((item) => {
      const route =
        item.to || item.href ? router.resolve(item.to ?? item.href!) : null;
      const auth = route?.meta?.auth;

      // Remove items the user does not have access to
      if (typeof auth === "object" && auth.role && !hasRole(auth.role)) {
        return false;
      }

      return true;
    });

  if (!result.some((item) => item.to || item.href || item.children?.length)) {
    // Return an empty array if the resulting array has no valid items
    return [];
  }

  return result;
};

const normalizedItems = computed(() =>
  items.value
    .map((group) => filterItems(group))
    .filter((group) => group.length > 0)
);
</script>

<template>
  <div class="grid grid-cols-10">
    <DefineNavTemplate>
      <UNavigationMenu orientation="vertical" :items="normalizedItems" />
    </DefineNavTemplate>

    <aside
      v-if="isDesktop"
      class="col-span-2 p-4 pl-0 h-[calc(100vh-var(--ui-header-height))] overflow-y-auto sticky top-(--ui-header-height) border-r border-default z-90"
    >
      <UseNavTemplate />
    </aside>

    <USlideover
      v-else
      v-model:open="open"
      side="left"
      class="mt-(--ui-header-height) max-w-xs bg-default/75 backdrop-blur border-r border-default z-90"
      :portal="false"
      :modal="false"
      :ui="{
        overlay: 'absolute',
      }"
    >
      <template #content>
        <div class="p-4">
          <UseNavTemplate />
        </div>
      </template>
    </USlideover>

    <div class="col-span-10 md:col-span-8">
      <slot />
    </div>
  </div>
</template>
