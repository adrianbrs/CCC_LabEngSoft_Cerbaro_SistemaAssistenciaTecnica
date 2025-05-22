<script setup lang="ts">
definePageMeta({
  layout: "single-card",
  auth: false,
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

useAsyncData(() => logout(), {
  immediate: true,
  transform() {
    router.replace("/login");
  },
});
</script>

<template>
  <UCard class="w-full sm:w-[500px]">
    <UAlert
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
