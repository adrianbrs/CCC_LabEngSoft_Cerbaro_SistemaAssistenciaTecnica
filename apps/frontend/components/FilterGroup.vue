<script setup lang="tsx">
import { UButton, UDrawer } from "#components";
import type { UnwrapRef, VNode } from "vue";

type SlotProps = UnwrapRef<typeof context>;

const container = useTemplateRef("container");
const triggerRef = useTemplateRef("trigger");
const itemRefs = useTemplateRef<HTMLDivElement[]>("items");
const hiddenIndexes = ref(new Map<number, number>());

const {
  title = undefined,
  dirty,
  align = "start",
  onReset = undefined,
} = defineProps<{
  title?: string;
  dirty?: boolean;
  align?: "start" | "end";
  onReset?: () => void;
}>();

const open = defineModel<boolean>("open", {
  default: false,
});

const slots = defineSlots<{
  default(props: SlotProps): VNode[];
  trigger?(props: SlotProps): VNode;
  "trigger-open"?(props: SlotProps): VNode;
  "trigger-reset"?(props: SlotProps): VNode;
  "drawer-header"?(props: SlotProps): VNode;
  "drawer-footer"?(props: SlotProps): VNode;
}>();

const context = computed(() => ({
  open: open.value,
  toggle: (value?: boolean) => {
    open.value = value ?? !open.value;
  },
  reset: onReset,
  dirty: dirty,
}));

const children = computed(() => {
  const el = slots.default(context.value);
  return (Array.isArray(el) ? el : el ? [el] : []).map((vnode, index) => (
    <div class="flex-shrink-0" data-node-index={index}>
      {vnode}
    </div>
  ));
});

const getNodeIndex = (el: HTMLElement): number =>
  Number(el.dataset.nodeIndex ?? 0);

const getMinWidth = (
  el: HTMLElement,
  containerBounds: DOMRect,
  triggerBounds?: DOMRect
): number => {
  const rect = el.getBoundingClientRect();

  const left =
    align === "end" &&
    triggerBounds &&
    el.previousElementSibling === triggerRef.value
      ? triggerBounds.left
      : rect.left;
  const right =
    align === "start" &&
    triggerBounds &&
    el.nextElementSibling === triggerRef.value
      ? triggerBounds.right ?? 0
      : rect.right;
  const width = right - left;

  const relLeft = Math.max(0, left - containerBounds.left);
  const relRight = Math.max(0, containerBounds.right - right);
  return relLeft + width + relRight;
};

useResizeObserver(container, () => {
  const containerEl = container.value;
  if (!containerEl) return;

  const containerBounds = containerEl.getBoundingClientRect();
  const triggerBounds = triggerRef.value?.getBoundingClientRect();

  [...(itemRefs.value ?? []), ...hiddenIndexes.value.keys()].forEach(
    (itemOrIndex) => {
      const index =
        typeof itemOrIndex === "number"
          ? itemOrIndex
          : getNodeIndex(itemOrIndex);
      const minWidth =
        typeof itemOrIndex === "number"
          ? hiddenIndexes.value.get(index)!
          : getMinWidth(itemOrIndex, containerBounds, triggerBounds);

      if (containerBounds.width < minWidth) {
        if (!hiddenIndexes.value.has(index)) {
          hiddenIndexes.value.set(index, minWidth);
        }
      } else {
        hiddenIndexes.value.delete(index);
      }
    }
  );
});

const elements = computed(() => {
  if (!itemRefs.value) {
    return { visible: children.value, hidden: [] };
  }

  const visible: VNode[] = [];
  const hidden: VNode[] = [];

  children.value.forEach((vnode, index) => {
    if (hiddenIndexes.value.has(index)) {
      hidden.push(vnode);
    } else {
      visible.push(vnode);
    }
  });

  return { visible, hidden };
});

watch(
  () => !!elements.value.hidden.length,
  (hasHidden) => {
    if (!hasHidden && open.value) {
      open.value = false;
    }
  }
);

const [DefineTrigger, UseTrigger] = createReusableTemplate();
</script>

<template>
  <div
    ref="container"
    :class="[
      'w-full flex items-center gap-2 min-w-0',
      {
        'justify-start': align === 'start',
        'justify-end': align === 'end',
      },
    ]"
  >
    <DefineTrigger>
      <div
        v-if="elements.hidden.length || onReset"
        ref="trigger"
        class="flex-shrink-0"
      >
        <slot
          v-if="elements.hidden.length"
          name="trigger-open"
          v-bind="context"
        >
          <UChip :show="dirty">
            <UButton
              class="cursor-pointer"
              icon="i-lucide-list-filter-plus"
              variant="outline"
              aria-label="Ver mais filtros"
              color="neutral"
              @click="open = !open"
            />
          </UChip>
        </slot>

        <slot v-else name="trigger-reset" v-bind="context">
          <UButton
            class="cursor-pointer"
            icon="i-lucide-x"
            variant="outline"
            aria-label="Limpar filtros"
            color="neutral"
            :disabled="dirty === false"
            @click="onReset"
          />
        </slot>
      </div>
    </DefineTrigger>

    <UseTrigger v-if="align === 'end'" />

    <component
      :is="el"
      v-for="el of elements.visible"
      :key="children.indexOf(el)"
      ref="items"
    />

    <UseTrigger v-if="align === 'start'" />

    <UDrawer
      v-model:open="open"
      :dismissable="false"
      :title="title ?? 'Filtros'"
      :overlay="false"
      :modal="false"
      :handle="false"
      :ui="{ header: 'flex items-center justify-between' }"
    >
      <template #header>
        <slot name="drawer-header" v-bind="context">
          <h2 class="text-highlighted font-semibold">
            {{ title ?? "Filtros" }}
          </h2>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            @click="open = false"
          />
        </slot>
      </template>

      <template #body>
        <div class="space-y-4">
          <component
            :is="el"
            v-for="el of elements.hidden"
            :key="children.indexOf(el)"
            ref="items"
            class="[&>*]:w-full"
          />
        </div>
      </template>

      <template #footer>
        <slot name="drawer-footer" v-bind="context">
          <div class="flex justify-end mt-4">
            <UButton
              v-if="onReset"
              color="error"
              variant="soft"
              icon="i-lucide-x"
              class="cursor-pointer"
              :disabled="dirty === false"
              @click="onReset()"
            >
              Limpar filtros
            </UButton>
          </div>
        </slot>
      </template>
    </UDrawer>
  </div>
</template>
