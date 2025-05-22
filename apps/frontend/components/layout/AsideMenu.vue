<script lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";
import type { RouteRecordRaw } from "vue-router";

declare module "#app" {
  interface PageMeta {
    nav?: Partial<NavigationMenuItem>;
  }
}
</script>

<script setup lang="ts">
const router = useRouter();
const open = defineModel<boolean>("open");

const items = computed<NavigationMenuItem[][]>(() => {
  const getItems = (
    routes: readonly RouteRecordRaw[]
  ): NavigationMenuItem[] => {
    return routes.flatMap((route) => {
      if (!route.meta?.nav) {
        if (route.children?.length) {
          return getItems(route.children);
        }
        return [];
      }

      return {
        to: {
          name: route.name,
          path: route.path,
        },
        ...(route.meta?.nav as NavigationMenuItem),
        ...(route.children && {
          children: getItems(route.children),
        }),
      };
    });
  };

  return [getItems(router.options.routes)];
});

const isDesktop = useMediaQuery("(width >= 48rem)");
const [DefineNavTemplate, UseNavTemplate] = createReusableTemplate();
</script>

<template>
  <div class="grid grid-cols-10">
    <DefineNavTemplate>
      <UNavigationMenu orientation="vertical" :items="items" />
    </DefineNavTemplate>

    <aside
      v-if="isDesktop"
      class="col-span-2 p-4 pl-0 h-[calc(100vh-var(--ui-header-height))] overflow-y-auto sticky top-(--ui-header-height) border-r border-default"
    >
      <UseNavTemplate />
    </aside>

    <USlideover
      v-else
      v-model:open="open"
      side="left"
      class="mt-(--ui-header-height) max-w-xs bg-default/75 backdrop-blur border-r border-default z-10"
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
