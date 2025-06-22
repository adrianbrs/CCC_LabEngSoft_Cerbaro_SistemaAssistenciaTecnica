<script setup lang="ts">
const navOpen = ref(false);

useBreadcrumbs([
  {
    label: "Início",
    icon: "i-lucide-home",
    to: "/",
  },
]);
</script>

<template>
  <!-- a11y go to content button -->
  <UButton
    variant="solid"
    color="neutral"
    to="#content"
    class="not-focus-visible:sr-only fixed z-60 left-4 top-4"
  >
    Pular para o conteúdo
  </UButton>

  <LayoutNavbar>
    <template #navButton>
      <UButton
        class="md:hidden"
        variant="ghost"
        size="xl"
        color="neutral"
        icon="i-lucide-menu"
        @click="navOpen = !navOpen"
      />
    </template>
  </LayoutNavbar>

  <UContainer class="max-md:!px-0">
    <LayoutAsideMenu v-model:open="navOpen">
      <main id="content" class="min-h-(--ui-content-height)">
        <slot />
      </main>
    </LayoutAsideMenu>
  </UContainer>

  <LayoutFooter />
</template>

<style>
:root {
  --ui-content-height: calc(
    100vh - var(--ui-header-height, 0) - var(--ui-footer-height, 0)
  );
}
</style>
