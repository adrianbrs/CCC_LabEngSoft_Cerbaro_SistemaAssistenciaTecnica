<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";

const { user } = useUserSession(true);

const items = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: "Minha conta",
      icon: "i-lucide-user",
      to: "/account",
    },
  ],
  [
    {
      label: "Sair",
      icon: "i-lucide-log-out",
      to: "/logout",
    },
  ],
]);

const isLargeScreen = useMediaQuery("(width >= 48rem)");
</script>

<template>
  <UDropdownMenu
    :items="items"
    :ui="{
      content: 'w-48',
    }"
  >
    <UButton
      variant="ghost"
      color="neutral"
      class="flex items-center gap-2 cursor-pointer text-left rounded-none border-x border-default h-full p-4"
    >
      <UAvatar
        :size="isLargeScreen ? 'xl' : 'lg'"
        :alt="user.name"
        icon="i-lucide-user"
      />

      <div class="hidden md:block">
        <p class="text-md">{{ user.name }}</p>
        <p class="text-xs text-dimmed">{{ user.email }}</p>
      </div>
    </UButton>
  </UDropdownMenu>
</template>
