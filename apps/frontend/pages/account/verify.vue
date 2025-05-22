<script setup lang="ts">
definePageMeta({
  layout: "single-card",
  auth: false,
  validate(route) {
    const {
      query: { user, token },
    } = route;

    if (!user || !token) {
      return {
        statusCode: 400,
        statusMessage: "Usuário ou token não encontrados.",
      };
    }

    return true;
  },
});

useHead({
  title: "Verificação de Conta",
  meta: [
    {
      name: "description",
      content: "Verifique sua conta e comece a usar nossos serviços.",
    },
  ],
});

const {
  query: { user, token },
} = useRoute();

const { error, pending, refresh } = useApi(`/users/${user}/verify`, {
  method: "POST",
  retry: 1,
  body: {
    token,
  },
});
</script>

<template>
  <UCard class="w-full sm:w-[500px]">
    <template #header>
      <h2>Verificação de Conta</h2>
    </template>

    <Transition name="fade" mode="out-in">
      <UAlert
        v-if="pending"
        title="Verificação em andamento"
        description="Estamos verificando sua conta, por favor, aguarde..."
        icon="i-lucide-user-round-cog"
        color="info"
      />
      <UAlert
        v-else-if="error"
        title="Erro ao verificar conta"
        description="Não foi possível verificar sua conta. Por favor, verifique se o link está correto ou entre em contato conosco."
        icon="i-lucide-triangle-alert"
        color="error"
        :actions="[
          {
            label: 'Tentar novamente',
            variant: 'subtle',
            color: 'neutral',
            class: 'cursor-pointer',
            onClick: () => {
              refresh();
            },
          },
        ]"
      />
      <UAlert
        v-else
        title="Conta verificada"
        description="Sua conta foi verificada com sucesso! Você já pode fazer login."
        icon="i-lucide-check-circle"
        color="success"
        :actions="[
          {
            label: 'Fazer login',
            variant: 'subtle',
            color: 'neutral',
            class: 'cursor-pointer',
            href: '/login',
          },
        ]"
      />
    </Transition>

    <template #footer>
      <UProgress :model-value="pending ? null : error ? 0 : 100" />
    </template>
  </UCard>
</template>
