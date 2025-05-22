<template>
  <div class="w-full min-h-[100vh] flex flex-col gap-8 justify-between">
    <header class="mx-auto px-8 py-6">
      <MusatLogo class="text-2xl" centered />
    </header>

    <UContainer class="flex">
      <main class="w-full sm:mx-auto sm:w-auto">
        <slot />
      </main>
    </UContainer>

    <LayoutFooter />
  </div>
</template>
