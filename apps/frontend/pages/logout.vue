<script setup lang="ts">
definePageMeta({
  layout: "single-card",
});

useHead({
  title: "Saindo...",
  meta: [
    {
      name: "description",
      content: "Saindo da sua conta...",
    },
  ],
});

const router = useRouter();
const { logout } = useUserSession();

const { pending } = useAsyncData(() => logout(), {
  immediate: true,
  transform() {
    router.replace("/login");
  },
});
</script>

<template>
  <UCard class="w-full md:w-[500px]">
    <UAlert
      v-if="pending"
      title="Desconectando..."
      description="Estamos desconectando você, por favor, aguarde..."
      icon="i-lucide-user-round-cog"
      color="info"
    />

    <template #footer>
      <UProgress />
    </template>
  </UCard>
</template>
