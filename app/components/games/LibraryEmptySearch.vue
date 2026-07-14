<template>
  <div class="py-16 text-center space-y-4 max-w-md mx-auto">
    <div class="p-4 bg-muted/30 text-muted-foreground rounded-full w-fit mx-auto border border-border/50">
      <SearchIcon class="w-8 h-8" />
    </div>
    <h3 class="text-lg font-bold text-neutral-200">{{ $t("index.noGames") }}</h3>
    <p class="text-sm text-muted-foreground leading-relaxed">
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
