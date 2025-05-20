<script setup lang="ts">
import { useUserSession } from "@/composables/useUserSession";
import type { IBrandEntity } from "@musat/core";

definePageMeta({
  middleware: ["auth"], 
});

const { isLoggedIn, user } = useUserSession(true);

const { data: brands, error, pending, refresh } = await useFetch<IBrandEntity[]>("/brands", {
  credentials: "include",
});
</script>

<template>
  <UContainer>
    <h1 class="text-2xl font-bold my-4">Marcas Cadastradas</h1>

    <UAlert
      v-if="error"
      color="red"
      title="Erro ao carregar marcas"
      description="Verifique sua conexão ou tente novamente mais tarde."
    />

    <USkeleton v-if="pending" class="h-16 w-full mb-2" v-for="i in 3" :key="i" />

    <ul v-else class="space-y-4">
      <li v-for="brand in brands" :key="brand.id" class="border p-4 rounded">
        <p><strong>Nome:</strong> {{ brand.name }}</p>
        <p><strong>E-mail:</strong> {{ brand.email }}</p>
        <p><strong>Telefone:</strong> {{ brand.phone }}</p>
      </li>
    </ul>
  </UContainer>
</template>
