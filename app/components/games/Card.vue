<template>
  <NuxtLinkLocale
    :to="`/game/${game.appid}`"
    class="block h-full group"
  >
    <UiCard class="flex flex-col h-full overflow-hidden hover:border-cyan-500/50 transition-colors duration-200">
      <!-- Game Capsule Banner -->
      <div class="relative aspect-[460/215] overflow-hidden bg-muted shrink-0">
        <img
          :src="game.header_img"
          :alt="game.name"
          loading="lazy"
          class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          @error="handleImageError"
        />
      </div>

      <!-- Game Details -->
      <UiCardContent class="flex flex-col flex-1 justify-between p-4 gap-4">
        <div>
          <h3
            class="font-bold text-sm sm:text-base text-foreground group-hover:text-cyan-500 transition-colors line-clamp-1 tracking-tight"
          >
            {{ game.name }}
          </h3>

          <div class="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground font-medium">
            <span>{{ $t("index.lastLaunched", { time: game.last_played_relative }) }}</span>
          </div>
        </div>

        <!-- Playtime Stats -->
        <div class="flex items-center justify-between pt-3 border-t border-border/60">
          <div class="flex flex-col">
            <span class="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              {{ $t("index.totalPlaytimeCard") }}
            </span>
            <span class="text-xs font-bold text-foreground mt-0.5">
              {{ formatHours(game.playtime_hours) }} {{ $t("common.hoursSuffix") }}
            </span>
          </div>

          <!-- If played recently -->
          <div
            v-if="game.playtime_2weeks && game.playtime_2weeks > 0"
            class="flex flex-col items-end"
          >
            <span class="text-[10px] text-cyan-500 uppercase tracking-wider font-semibold">
              {{ $t("index.recent") }}
            </span>
            <span class="text-xs font-bold text-cyan-400 mt-0.5">
              +{{ Math.round((game.playtime_2weeks / 60) * 10) / 10 }} {{ $t("common.hoursSuffix") }}
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

