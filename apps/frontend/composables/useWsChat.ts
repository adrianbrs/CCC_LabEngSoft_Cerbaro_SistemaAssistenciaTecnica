import {
  ChatEvents,
  type IMessageQuery,
  type IMessageResponse,
  type IPaginatedEntity,
  type IUserPublicData,
} from "@musat/core";

export interface ChatMessage extends IMessageResponse {
  loading: boolean;
}

export interface ChatMessageGroup {
  from: IUserPublicData;
  messages: ChatMessage[];
}

function groupMessages(messages: ChatMessage[]): ChatMessageGroup[] {
  return messages.reduce((groups, message) => {
    const lastGroup = groups.at(-1);

    if (lastGroup && lastGroup.from.id === message.from.id) {
      lastGroup.messages.push(message);
      return groups;
    }

    groups.push({
      from: message.from,
      messages: [message],
    });

    return groups;
  }, [] as ChatMessageGroup[]);
}

const LOAD_MORE_TIMEOUT = 10000; // 10 seconds
const MESSAGES_PER_REQUEST = 20;

export function useWsChat(ticketId: MaybeRefOrGetter<string>) {
  const { user } = useUserSession(true);
  const page = ref(1);

  const ws = useWs();
  const api = useApiQuery<
    IPaginatedEntity<IMessageResponse>,
    IMessageQuery,
    IPaginatedEntity<ChatMessage>
  >(() => uri`/chat/${toValue(ticketId)}/messages`, {
    lazy: true,
    query: () => ({
      page: page.value,
      limit: MESSAGES_PER_REQUEST,
    }),
    transform: (data) => {
      return {
        ...data,
        items: data.items.map((item) => ({
          ...item,
          loading: false,
        })),
      };
    },
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

  const messages = ref<ChatMessage[]>(api.data.value?.items ?? []);
  const messageMap = ref(
    new Map<string, ChatMessage>(messages.value.map((m) => [m.id, m]))
  );
  const groups = ref(groupMessages(messages.value));
  const groupMap = ref(
    new Map<string, ChatMessageGroup>(groups.value.map((g) => [g.from.id, g]))
  );

  // Update messages with latest data from the API
  watch(api.data, (newData) => {
    // Messages already load, just append new messages
    if (messages.value.length) {
      newData?.items.forEach((item) => {
        onMessage(item, true);
      });

      if (loadingMoreTimeout.value != null) {
        clearTimeout(loadingMoreTimeout.value);
        loadingMoreTimeout.value = null;
      }

      loadingMore.value = false;
      return;
    }

    messages.value = newData?.items ?? [];
    messageMap.value = new Map(messages.value.map((m) => [m.id, m]));
    groups.value = groupMessages(messages.value);
    groupMap.value = new Map(groups.value.map((g) => [g.from.id, g]));
  });

  const sending = ref(false);
  const sendError = ref<Error | null>(null);

  const onMessage = (data: ChatMessage | IMessageResponse, prepend = false) => {
    const message: ChatMessage = {
      ...data,
      loading: (data as ChatMessage).loading ?? false,
    };
    const existingMessage = messageMap.value.get(message.id);

    if (existingMessage) {
      Object.assign(existingMessage, message);
      return;
    }

    const targetGroup = groups.value.at(prepend ? -1 : 0);
    if (targetGroup?.from.id === message.from.id) {
      if (prepend) {
        targetGroup.messages.push(message);
      } else {
        targetGroup.messages.unshift(message);
      }
    } else {
      const newGroups = groupMessages([message]);
      if (prepend) {
        groups.value.push(...newGroups);
      } else {
        groups.value.unshift(...newGroups);
      }
      newGroups.forEach((group) => {
        groupMap.value.set(group.from.id, group);
      });
    }
    messages.value.push(message);
    messageMap.value.set(message.id, message);
  };

  const updateMessage = (id: string, update: Partial<ChatMessage>) => {
    const message = messageMap.value.get(id);
    if (!message) {
      console.warn(`Message with id ${id} not found`);
      return;
    }
    Object.assign(message, update);

    if (update.id) {
      messageMap.value.delete(id);
      messageMap.value.set(message.id, message);
    }
  };

  const removeMessage = (id: string) => {
    const message = messageMap.value.get(id);
    if (!message) {
      console.warn(`Message with id ${id} not found`);
      return;
    }

    const messageIndex = messages.value.indexOf(message);
    if (messageIndex !== -1) {
      messages.value.splice(messageIndex, 1);
    }

    const group = groupMap.value.get(message.from.id);
    if (group) {
      const messageGroupIndex = group.messages.indexOf(message);
      if (messageGroupIndex !== -1) {
        group.messages.splice(messageGroupIndex, 1);
        if (group.messages.length === 0) {
          groups.value.splice(groups.value.indexOf(group), 1);
          groupMap.value.delete(group.from.id);
        }
      }
    }

    messageMap.value.delete(id);
  };

  onMounted(() => {
    ws.emit(ChatEvents.JOIN_SERVER, {
      ticketId: toValue(ticketId),
    });
    ws.on(ChatEvents.MESSAGE_CLIENT, onMessage);
  });

  onUnmounted(() => {
    ws.off(ChatEvents.MESSAGE_CLIENT, onMessage);
    ws.emit(ChatEvents.LEAVE_SERVER);
  });

  watchEffect(() => {
    const id = toValue(ticketId);

    if (!id) {
      ws.emit(ChatEvents.LEAVE_SERVER);
      return;
    }

    ws.emit(ChatEvents.JOIN_SERVER, {
      ticketId: toValue(ticketId),
    });
  });

  const send = async (content: string) => {
    sending.value = true;
    sendError.value = null;

    const message: ChatMessage = {
      id: crypto.randomUUID(),
      from: {
        id: user.value.id,
        name: user.value.name,
        role: user.value.role,
      },
      content,
      read: false,
      loading: true,
      ticketId: toValue(ticketId),
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    onMessage(message);

    return new Promise<IMessageResponse>((resolve, reject) => {
      ws.once("exception", reject);
      ws.emit(
        ChatEvents.MESSAGE_SERVER,
        {
          ticketId: toValue(ticketId),
          content: content,
        },
        (res) => {
          ws.off("exception", reject);
          resolve(res);
        }
      );
    })
      .then((res) => {
        updateMessage(message.id, res);
        return res;
      })
      .catch((err) => {
        removeMessage(message.id);
        sendError.value = err as Error;
        throw err;
      })
      .finally(() => {
        sending.value = false;
      });
  };

  return {
    send,
    loadMore,
    canLoadMore,
    groups,
    messages,
    sending: useDebounce(sending, 150),
    sendError,
    loading: computed(() => !api.data && api.status.value === "pending"),
    loadingMore: readonly(loadingMore),
  };
}
