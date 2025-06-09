<script lang="ts">
import type { BadgeProps, DropdownMenuItem } from "@nuxt/ui";
import { UserRole } from "@musat/core";

interface RoleOptions {
  color: BadgeProps["color"];
  label: string;
}

const roleOptions: Partial<Record<UserRole, RoleOptions>> = {
  [UserRole.TECHNICIAN]: {
    color: "info",
    label: "Técnico",
  },
  [UserRole.ADMIN]: {
    color: "error",
    label: "Admin",
  },
};
</script>

<script setup lang="ts">
const { user } = useUserSession(true);
const isDesktop = useMediaQuery("(width >= 48rem)");
const options = computed(() => roleOptions[user.value.role]);

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

          <UBadge
            v-if="options"
            size="sm"
            variant="soft"
            :color="options.color"
            class="rounded-full"
            >{{ options.label }}</UBadge
          >
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

            <UBadge
              v-if="options"
              size="sm"
              variant="soft"
              :color="options.color"
              class="rounded-full"
              >{{ options.label }}</UBadge
            >
          </div>
          <p class="text-xs text-dimmed">{{ user.email }}</p>
        </div>
      </div>
    </template>
  </UDropdownMenu>
</template>
