<template>
  <div class="mx-auto max-w-md space-y-4 py-16 text-center">
    <div
      class="bg-muted/30 text-muted-foreground border-border/50 mx-auto w-fit rounded-full border p-4"
    >
      <SearchIcon class="h-8 w-8" />
    </div>
    <h3 class="text-lg font-bold text-neutral-200">{{ $t("index.noGames") }}</h3>
    <p class="text-muted-foreground text-sm leading-relaxed">
      {{ $t("index.noGamesDesc") }}
    </p>
    <UiButton variant="outline" size="sm" @click="$emit('clear')">
      {{ $t("index.clearSearch") }}
    </UiButton>
  </div>
</template>

<script setup lang="ts">
import { SearchIcon } from "@lucide/vue";

defineEmits<{
  (e: "clear"): void;
}>();
</script>
