<script setup lang="ts">
import { NuxtLink } from "#components";

const open = defineModel<boolean>("open", {
  default: false,
});

const toast = useToast();
const {
  notifications,
  loadMore,
  canLoadMore,
  loadingMore,
  read,
  readAll,
  remove,
  removeAll,
} = useWsNotifications({
  onNotification(notification) {
    toast.add({
      title: notification.title,
      description: notification.content,
      actions: notification.metadata?.href
        ? [
            {
              label: "Abrir",
              href: notification.metadata.href,
              target: notification.metadata.target,
              variant: "soft",
              color: "neutral",
              icon: "i-lucide-external-link",
              onClick: () => {
                read(notification);
              },
            },
          ]
        : [],
    });
  },
});

// TODO: Now it's considering only fetched notifications, but we should call the API to know if there are any
// unread notifications
const hasUnreadNotifications = computed(() => {
  return notifications.value.some((notification) => !notification.read);
});

const notificationsRef = useTemplateRef("notificationsRef");
useInfiniteScroll(notificationsRef, loadMore, {
  canLoadMore: () => canLoadMore.value && !loadingMore.value,
  distance: 20,
  throttle: 100,
  interval: 100,
  direction: "bottom",
});
</script>

<template>
  <UPopover
    v-model:open="open"
    :ui="{
      content: 'min-w-48',
    }"
  >
    <UChip :show="hasUnreadNotifications">
      <UButton
        variant="soft"
        color="neutral"
        icon="i-lucide-bell"
        class="cursor-pointer"
      />
    </UChip>

    <template #content>
      <ul
        ref="notificationsRef"
        class="list-none p-0 m-0 max-h-80 overflow-y-auto"
      >
        <li
          v-for="notification in notifications"
          :key="notification.id"
          class="border-b border-default last:border-none"
        >
          <component
            :is="notification.metadata?.href ? NuxtLink : 'div'"
            :href="notification.metadata?.href"
            :target="notification.metadata?.target"
            class="block py-2 px-4 hover:bg-elevated/50"
            @click="
              () => {
                if (!notification.metadata?.href) {
                  return;
                }
                if (!notification.read) {
                  read(notification);
                }
                open = false;
              }
            "
          >
            <div class="space-y-2 justify-between">
              <div>
                <div class="flex items-center gap-2">
                  <p class="font-semibold m-0 truncate">
                    {{ notification.title }}
                  </p>

                  <UChip v-if="!notification.read" standalone inset />
                </div>
                <p class="text-sm text-dimmed">{{ notification.content }}</p>
              </div>
              <div class="flex items-center justify-start gap-2">
                <UButton
                  variant="soft"
                  color="neutral"
                  size="xs"
                  class="cursor-pointer"
                  icon="i-lucide-trash-2"
                  @click.stop.prevent="remove(notification)"
                >
                  Excluir
                </UButton>

                <UButton
                  v-if="!notification.read"
                  variant="link"
                  color="neutral"
                  size="xs"
                  class="cursor-pointer"
                  @click.stop.prevent="read(notification)"
                >
                  Marcar como lida
                </UButton>
              </div>
            </div>
          </component>
        </li>
        <li v-if="!notifications.length" class="px-4 py-6">
          <EmptyState
            icon="i-lucide-bell-off"
            description="Nenhuma notificação"
            :ui="{
              icon: 'size-6 text-muted',
            }"
          />
        </li>
      </ul>

      <div
        v-if="notifications.length"
        class="p-2 sticky bottom-0 bg-default flex items-center justify-center gap-2 rounded-b-md"
      >
        <UButton
          variant="link"
          color="neutral"
          class="cursor-pointer"
          @click="removeAll()"
        >
          Excluir notificações
        </UButton>
        <UButton
          variant="link"
          color="neutral"
          class="cursor-pointer"
          @click="readAll()"
        >
          Marcar todas como lidas
        </UButton>
      </div>
    </template>
  </UPopover>
</template>
