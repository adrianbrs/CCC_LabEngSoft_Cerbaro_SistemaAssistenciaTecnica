<script setup lang="ts"></script>

<template>
  <header
    class="bg-default/75 backdrop-blur border-b border-default sticky top-0 z-100 h-(--ui-header-height)"
  >
    <UContainer class="flex items-center justify-between gap-3 h-full">
      <div class="lg:flex-1 min-w-0 flex items-center gap-3">
        <slot name="navButton" />

        <NuxtLink aria-label="Ir a página inicial" to="/">
          <MusatLogo />
        </NuxtLink>
      </div>

      <div class="flex-1 flex items-center justify-end gap-4 h-full">
        <AccountNotifications />
        <AccountMenu />
      </div>
    </UContainer>
  </header>
</template>

<style>
:root {
  --ui-header-height: calc(var(--spacing) * 16);
}
</style>
