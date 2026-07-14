<template>
  <NuxtLinkLocale :to="`/game/${game.appid}`" class="group block h-full">
    <UiCard
      class="flex h-full flex-col overflow-hidden transition-colors duration-200 hover:border-cyan-500/50"
    >
      <!-- Game Capsule Banner -->
      <div class="bg-muted relative aspect-[460/215] shrink-0 overflow-hidden">
        <img
          :src="game.header_img"
          :alt="game.name"
          loading="lazy"
          class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          @error="handleImageError"
        />
      </div>

      <!-- Game Details -->
      <UiCardContent class="flex flex-1 flex-col justify-between gap-4 p-4">
        <div>
          <h3
            class="text-foreground line-clamp-1 text-sm font-bold tracking-tight transition-colors group-hover:text-cyan-500 sm:text-base"
          >
            {{ game.name }}
          </h3>

          <div class="text-muted-foreground mt-1.5 flex items-center gap-1.5 text-xs font-medium">
            <span>{{ $t("index.lastLaunched", { time: game.last_played_relative }) }}</span>
          </div>
        </div>

        <!-- Playtime Stats -->
        <div class="border-border/60 flex items-center justify-between border-t pt-3">
          <div class="flex flex-col">
            <span class="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
              {{ $t("index.totalPlaytimeCard") }}
            </span>
            <span class="text-foreground mt-0.5 text-xs font-bold">
              {{ formatHours(game.playtime_hours) }} {{ $t("common.hoursSuffix") }}
            </span>
          </div>

          <!-- If played recently -->
          <div
            v-if="game.playtime_2weeks && game.playtime_2weeks > 0"
            class="flex flex-col items-end"
          >
            <span class="text-[10px] font-semibold tracking-wider text-cyan-500 uppercase">
              {{ $t("index.recent") }}
            </span>
            <span class="mt-0.5 text-xs font-bold text-cyan-400">
              +{{ Math.round((game.playtime_2weeks / 60) * 10) / 10 }}
              {{ $t("common.hoursSuffix") }}
            </span>
          </div>
        </div>
      </UiCardContent>
    </UiCard>
  </NuxtLinkLocale>
</template>

<script lang="ts" setup>
import type { SteamGame } from "~/types";

defineProps<{
  game: SteamGame;
}>();

// TODO: костиль
function handleImageError(event: Event) {
  const target = event.target as HTMLImageElement;
  if (target) {
    target.src =
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=460&h=215";
  }
}

function formatHours(hours: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(hours);
}
</script>
