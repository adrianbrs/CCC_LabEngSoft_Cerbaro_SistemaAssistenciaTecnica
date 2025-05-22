<script setup lang="ts"></script>

<template>
  <header
    class="bg-default/75 backdrop-blur border-b border-default sticky top-0 z-50 h-(--ui-header-height)"
  >
    <div
      class="w-full max-w-(--ui-container) mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 h-full"
    >
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
    </div>
  </header>
</template>

<style>
:root {
  --ui-header-height: calc(var(--spacing) * 16);
}
</style>
