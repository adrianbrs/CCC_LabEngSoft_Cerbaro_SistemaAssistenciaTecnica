import type {
  IMessageQuery,
  INotificationReadEvent,
  INotificationResponse,
  IPaginatedEntity,
} from "@musat/core";

const LOAD_MORE_TIMEOUT = 10000; // 10 seconds
const MESSAGES_PER_REQUEST = 20;

export interface UseWsNotificationsOptions {
  onNotification?: (notification: INotificationResponse) => void;
}

export function useWsNotifications(options?: UseWsNotificationsOptions) {
  const page = ref(1);

  const { ws, emitAsync } = useWs();
  const api = useApiQuery<
    IPaginatedEntity<INotificationResponse>,
    IMessageQuery
  >("/notifications/me", {
    lazy: true,
    query: () => ({
      page: page.value,
      limit: MESSAGES_PER_REQUEST,
    }),
  });

  const loadingMore = ref(false);
  const loadingMoreTimeout = ref<ReturnType<typeof setTimeout> | null>(null);
  const canLoadMore = computed(() => !!api.data.value?.hasNextPage);

  const loadMore = () => {
    if (canLoadMore.value) {
      loadingMore.value = true;
      page.value++;

      if (loadingMoreTimeout.value !== null) {
        clearTimeout(loadingMoreTimeout.value);
      }

      loadingMoreTimeout.value = setTimeout(() => {
        loadingMore.value = false;
        loadingMoreTimeout.value = null;
      }, LOAD_MORE_TIMEOUT);
    }
  };

  const notifications = ref<INotificationResponse[]>(
    api.data.value?.items ?? []
  );
  const notificationsMap = ref(
    new Map<string, INotificationResponse>(
      notifications.value.map((m) => [m.id, m])
    )
  );

  watch(api.data, (newData) => {
    if (!newData) {
      return;
    }

    if (notifications.value.length) {
      newData?.items.forEach((item) => {
        handleNotification(item, true, false);
      });

      if (loadingMoreTimeout.value != null) {
        clearTimeout(loadingMoreTimeout.value);
        loadingMoreTimeout.value = null;
      }

      loadingMore.value = false;
      return;
    }

    notifications.value = newData?.items ?? [];
    notificationsMap.value = new Map(notifications.value.map((m) => [m.id, m]));
  });

  const handleNotification = (
    data: INotificationResponse,
    appendOrIndex: boolean | number = false,
    callHooks = true
  ) => {
    const notification = reactive({
      ...data,
    });
    const existingNotification = notificationsMap.value.get(notification.id);

    if (existingNotification) {
      Object.assign(existingNotification, notification);
      return;
    }

    if (appendOrIndex === true) {
      notifications.value.push(notification);
    } else if (appendOrIndex === false) {
      notifications.value.unshift(notification);
    } else {
      notifications.value.splice(appendOrIndex, 0, notification);
    }

    notificationsMap.value.set(notification.id, notification);
    if (callHooks) {
      options?.onNotification?.(notification);
    }
  };

  const updateNotification = (
    id: string,
    update: Partial<INotificationResponse>
  ) => {
    const notification = notificationsMap.value.get(id);
    if (!notification) {
      // The user didn't load the message yet, so we can't update it
      return;
    }
    Object.assign(notification, update);

    if (update.id) {
      notificationsMap.value.delete(id);
      notificationsMap.value.set(notification.id, notification);
    }
  };

  const removeNotification = (id: string) => {
    const notification = notificationsMap.value.get(id);
    if (!notification) {
      console.warn(`Notification with id ${id} not found`);
      return -1;
    }

    const notificationIndex = notifications.value.indexOf(notification);
    if (notificationIndex !== -1) {
      notifications.value.splice(notificationIndex, 1);
    }

    notificationsMap.value.delete(id);
    return notificationIndex;
  };

  const onRead = (event: INotificationReadEvent) => {
    const { notificationIds } = event;
    notificationIds.forEach((id) => {
      updateNotification(id, { read: true });
    });
  };

  onMounted(() => {
    ws.on(NotificationEvents.RECEIVE_CLIENT, handleNotification);
    ws.on(NotificationEvents.READ, onRead);
  });

  onUnmounted(() => {
    ws.off(NotificationEvents.RECEIVE_CLIENT, handleNotification);
    ws.off(NotificationEvents.READ, onRead);
  });

  const read = async (notification: INotificationResponse) => {
    updateNotification(notification.id, { read: true });
    try {
      await emitAsync(NotificationEvents.READ, {
        notificationIds: [notification.id],
      });
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      updateNotification(notification.id, { read: false });
      throw err;
    }
  };

  // TODO: Create a custom event for marking all notifications as read
  const readAll = async () => {
    if (!notifications.value.length) {
      return;
    }
    const ids = notifications.value.map((m) => m.id);
    ids.forEach((id) => updateNotification(id, { read: true }));
    try {
      await emitAsync(NotificationEvents.READ, {
        notificationIds: ids,
      });
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
      ids.forEach((id) => updateNotification(id, { read: false }));
      throw err;
    }
  };

  const remove = async (notification: INotificationResponse) => {
    const index = removeNotification(notification.id);
    try {
      await emitAsync(NotificationEvents.REMOVE, {
        notificationIds: [notification.id],
      });
    } catch (err) {
      console.error("Failed to delete notification:", err);
      handleNotification(notification, index, false);
      throw err;
    }
  };

  // TODO: Create a custom event for removing all notifications
  const removeAll = async () => {
    if (!notifications.value.length) {
      return;
    }

    const copy = notifications.value.slice();
    notifications.value = [];
    notificationsMap.value.clear();

    try {
      await emitAsync(NotificationEvents.REMOVE, {
        notificationIds: copy.map((m) => m.id),
      });
    } catch (err) {
      console.error("Failed to clear notifications:", err);
      notifications.value = copy; // Restore notifications on error
      notificationsMap.value = new Map(copy.map((m) => [m.id, m]));
      throw err;
    }
  };

  return {
    loadMore,
    read,
    readAll,
    remove,
    removeAll,
    canLoadMore,
    notifications,
    loading: computed(() => !api.data.value && api.status.value === "pending"),
    loadingMore: readonly(loadingMore),
  };
}
