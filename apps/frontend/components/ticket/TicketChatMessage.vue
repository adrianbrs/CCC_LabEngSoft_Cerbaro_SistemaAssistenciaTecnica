<script setup lang="ts">
import type { IMessageResponse } from "@musat/core";

const props = defineProps<{
  message: IMessageResponse;
  header?: boolean;
}>();

const { user } = useUserSession(true);
const isFromMe = computed(() => user.value?.id === props.message.from.id);
const showHeader = computed(() => !isFromMe.value && !!props.header);
</script>

<template>
  <li
    :class="[
      'w-full flex items-center not-first:[&>div>h5]:hidden',
      isFromMe
        ? 'justify-end first:[&>div]:rounded-tr-none'
        : 'justify-start first:[&>div]:rounded-tl-none first:[&>div]:sticky first:[&>div]:top-0',
    ]"
  >
    <div
      :class="[
        'rounded-lg py-2 px-3',
        isFromMe ? 'bg-primary/20' : 'bg-elevated/50',
      ]"
    >
      <p class="whitespace-pre-line text-balance wrap-anywhere">
        {{ message.content }}

        <span
          class="flex float-right ml-2 mt-2"
          :title="$dfns.formatDateTime(message.createdAt)"
        >
          <span class="text-xs text-muted">
            {{ $dfns.formatTime(message.createdAt) }}
          </span>
        </span>
      </p>
    </div>
  </li>

  <!-- We're using col-reverse, so the header must be at the end to be displayed before -->
  <div
    v-if="showHeader"
    class="w-full bg-default py-2 pr-2 sticky -mb-1 -top-4 z-10"
  >
    <h5 class="text-primary text-sm font-semibold">
      {{ message.from.name }}
    </h5>
  </div>
</template>
