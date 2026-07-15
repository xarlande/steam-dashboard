<template>
  <NuxtLoadingIndicator color="#22d3ee" :height="3" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script lang="ts" setup>
useSeoMeta({
  title: "Steam Library Space",
});
</script>
