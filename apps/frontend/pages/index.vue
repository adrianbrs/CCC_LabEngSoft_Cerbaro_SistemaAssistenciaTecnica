<script setup lang="ts">
const { user } = useUserSession(true);
</script>

<template>
  <LayoutPage>
    <h1>Hello, {{ user.name }}!</h1>
  </LayoutPage>
</template>
