<template>
  <UContainer class="w-full min-h-[100vh] flex">
    <div class="mx-auto flex flex-col justify-between">
      <header class="w-full text-center mb-8 px-8 py-6">
        <h1 class="text-3xl font-black">MUSAT</h1>
        <p class="text-xl">Assistência Técnica</p>
      </header>

      <main>
        <slot />
      </main>

      <footer class="w-full text-center mt-8 px-8 py-6">
        <p class="text-sm text-gray-500">
          &copy; {{ new Date().getFullYear() }} MUSAT. Todos os direitos
          reservados.
        </p>
      </footer>
    </div>
  </UContainer>
</template>
