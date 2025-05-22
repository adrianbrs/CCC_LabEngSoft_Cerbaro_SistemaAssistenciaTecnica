<template>
  <footer
    class="w-full h-(--ui-footer-height) flex items-center justify-center text-center px-4 bg-default border-t border-default"
  >
    <p class="text-xs sm:text-sm text-gray-500">
      &copy; {{ new Date().getFullYear() }} MUSAT. Todos os direitos reservados.
    </p>
  </footer>
</template>

<style>
:root {
  --ui-footer-height: calc(var(--spacing) * 12);
}
</style>
