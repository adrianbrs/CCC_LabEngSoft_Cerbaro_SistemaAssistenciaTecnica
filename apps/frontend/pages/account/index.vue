<script setup lang="ts">
useHead({
  title: "Minha conta",
});

const { user } = useUserSession(true);
</script>

<template>
  <LayoutPage title="Minha conta">
    <h2>{{ user.name }}</h2>
  </LayoutPage>
</template>
