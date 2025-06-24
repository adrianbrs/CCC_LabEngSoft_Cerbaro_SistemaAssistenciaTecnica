<script setup lang="ts">
import type { ITicketEntity } from "@musat/core";
import type { FormSubmitEvent } from "@nuxt/ui";
import * as _ from "lodash-es";

const { ticket, scrollTreshold = 200 } = defineProps<{
  ticket: ITicketEntity;
  scrollTreshold?: number;
}>();

const { send, loadMore, canLoadMore, loadingMore, groups, loading } = useWsChat(
  () => ticket.id
);
const isClosed = computed(() => isTicketClosed(ticket));
const messageInput = useTemplateRef("message");
const messageList = useTemplateRef("messageList");
const { arrivedState, y: scrollY } = useScroll(messageList, {
  behavior: "instant",
  throttle: 100,
  offset: {
    bottom: scrollTreshold,
  },
});
const isAtBottom = computed(() => arrivedState.bottom);

useInfiniteScroll(messageList, loadMore, {
  canLoadMore: () => canLoadMore.value && !loadingMore.value,
  distance: 10,
  throttle: 100,
  interval: 100,
  direction: "top",
});

const state = reactive({
  message: "",
});

watch(
  groups,
  (newData, oldData) => {
    if (isAtBottom.value || (newData && !oldData)) {
      requestAnimationFrame(() => {
        scrollY.value = messageList.value?.scrollHeight || 0;
      });
    }
  },
  { immediate: true, deep: true }
);

const onSubmit = async ({ data }: FormSubmitEvent<typeof state>) => {
  const { message } = _.cloneDeep(toRaw(data));

  if (!message) {
    return;
  }

  await send(message);
  state.message = "";
  requestAnimationFrame(() => {
    messageInput.value?.textareaRef?.focus();
  });
};
</script>

<template>
  <div
    class="w-[100vw] -ml-4 sm:w-full sm:ml-0 h-full min-h-0 flex flex-col justify-end gap-2 overflow-hidden border-t sm:rounded-t-md border-default"
  >
    <div class="relative w-full flex-1 flex flex-col min-h-0">
      <ul
        ref="messageList"
        class="list-none w-full flex-1 overflow-y-auto sm:rounded-md sm:border-x border-b border-default p-4 bg-default flex flex-col-reverse gap-4"
      >
        <li v-for="group in groups" :key="group.from.id" class="w-full">
          <ul class="list-none w-full flex flex-col-reverse gap-1">
            <!-- We are using col-reverse, so the last index will be the first message -->
            <TicketChatMessage
              v-for="(message, index) in group.messages"
              :key="message.id"
              :message="message"
              :header="index === group.messages.length - 1"
            />
          </ul>
        </li>

        <div
          v-if="!groups.length || loading"
          class="w-full h-full flex items-center justify-center"
        >
          <EmptyState v-if="loading" description="Carregando mensagens...">
            <template #asset>
              <LoadingIndicator class="size-6 text-primary" />
            </template>
          </EmptyState>
          <EmptyState
            v-else-if="!groups.length"
            title="Nenhuma mensagem"
            description="Não há nenhuma mensagem nesta conversa ainda."
            icon="i-lucide-messages-square"
          />
        </div>
      </ul>

      <div
        v-if="!isAtBottom"
        class="absolute px-2 bottom-4 z-20 w-full flex items-center justify-end md:bottom-2 md:justify-center"
      >
        <UButton
          variant="soft"
          color="neutral"
          class="cursor-pointer rounded-full"
          trailing-icon="i-lucide-chevron-down"
          @click="scrollY = messageList?.scrollHeight ?? 0"
        >
          <span class="hidden md:block">Ver mensagens recentes</span>
        </UButton>
      </div>
    </div>

    <p
      v-if="isClosed"
      class="w-full p-4 text-center text-muted text-sm md:text-base"
    >
      Esta solicitação está fechada e não pode mais receber mensagens.
    </p>
    <UForm
      v-else
      class="px-2 sm:px-0 w-full flex items-end gap-1.25"
      :state="state"
      @submit="onSubmit"
    >
      <UTextarea
        ref="message"
        v-model="state.message"
        placeholder="Digite sua mensagem..."
        autoresize
        :rows="1"
        class="flex-1"
      />

      <UButton
        variant="subtle"
        icon="i-lucide-send"
        class="cursor-pointer"
        trailing
        type="submit"
      >
        <span class="hidden md:block">Enviar</span>
      </UButton>
    </UForm>
  </div>
</template>
