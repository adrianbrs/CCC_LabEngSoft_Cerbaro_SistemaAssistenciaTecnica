<script setup lang="ts">
import { UserRole } from "@musat/core";
import type { DropdownMenuItem } from "@nuxt/ui";
const { user } = useUserSession(true);
const isDesktop = useMediaQuery("(width >= 48rem)");

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
</script>

<template>
  <UDropdownMenu
    :items="items"
    :ui="{
      content: 'min-w-48',
    }"
  >
    <UButton
      variant="ghost"
      color="neutral"
      class="flex items-center gap-2 cursor-pointer text-left rounded-none h-full p-4"
    >
      <UAvatar :alt="user.name" size="lg" icon="i-lucide-user" />

      <div class="hidden md:block">
        <div class="flex gap-1">
          <p class="text-md truncate">{{ user.name }}</p>

          <UserRoleBadge
            v-if="user.role !== UserRole.CLIENT"
            :role="user.role"
            size="sm"
          />
        </div>
        <p class="text-xs text-dimmed">{{ user.email }}</p>
      </div>
    </UButton>

    <template #content-top>
      <div v-if="!isDesktop" class="flex items-center gap-2 p-4">
        <UAvatar size="lg" :alt="user.name" icon="i-lucide-user" />

        <div>
          <div class="flex gap-1">
            <p class="text-md truncate">{{ user.name }}</p>

            <UserRoleBadge
              v-if="user.role !== UserRole.CLIENT"
              :role="user.role"
              size="sm"
            />
          </div>
          <p class="text-xs text-dimmed">{{ user.email }}</p>
        </div>
      </div>
    </template>
  </UDropdownMenu>
</template>
