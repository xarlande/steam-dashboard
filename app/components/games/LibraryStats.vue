<template>
  <section
    v-if="games.length > 0"
    class="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8 animate-fade-in"
  >
    <!-- Stat Card 1: Total Games -->
    <UiCard class="relative overflow-hidden bg-card/45 border-border/50">
      <UiCardContent class="p-6">
        <div class="absolute -right-4 -bottom-4 opacity-10 text-cyan-400">
          <Gamepad2Icon class="w-24 h-24" />
        </div>
        <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {{ $t("index.stats.totalGames") }}
        </p>
        <p class="text-3xl font-extrabold mt-2 tracking-tight">{{ totalCount }}</p>
        <p class="text-xs text-muted-foreground/85 mt-1">
          {{ $t("index.stats.totalGamesDesc") }}
        </p>
      </UiCardContent>
    </UiCard>

    <!-- Stat Card 2: Total Time -->
    <UiCard class="relative overflow-hidden bg-card/45 border-border/50">
      <UiCardContent class="p-6">
        <div class="absolute -right-4 -bottom-4 opacity-10 text-violet-400">
          <ClockIcon class="w-24 h-24" />
        </div>
        <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {{ $t("index.stats.totalPlaytime") }}
        </p>
        <p class="text-3xl font-extrabold mt-2 tracking-tight">
          {{ formatHours(totalHours) }}
          <span class="text-sm font-semibold text-muted-foreground">
            {{ $t("common.hoursSuffix") }}
          </span>
        </p>
        <p class="text-xs text-muted-foreground/85 mt-1">
          {{ $t("index.stats.totalPlaytimeDesc") }}
        </p>
      </UiCardContent>
    </UiCard>

    <!-- Stat Card 3: Most Played -->
    <UiCard class="relative overflow-hidden bg-card/45 border-border/50">
      <UiCardContent class="p-6">
        <div class="absolute -right-4 -bottom-4 opacity-10 text-indigo-400">
          <StarIcon class="w-24 h-24" />
        </div>
        <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {{ $t("index.stats.mostPlayed") }}
        </p>
        <p class="text-xl font-extrabold mt-2 truncate pr-16 tracking-tight">
          {{ mostPlayedGame?.name || $t("index.stats.none") }}
        </p>
        <p class="text-xs mt-1 font-semibold text-indigo-400">
          {{
            mostPlayedGame
              ? formatHours(mostPlayedGame.playtime_hours) + " " + $t("common.hoursSuffix")
              : "0 " + $t("common.hoursSuffix")
          }}
        </p>
      </UiCardContent>
    </UiCard>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Gamepad2Icon, ClockIcon, StarIcon } from "@lucide/vue";
import type { SteamGame } from "~/types";

const props = defineProps<{
  games: SteamGame[];
}>();

const totalCount = computed(() => props.games.length);
const totalHours = computed(() => {
  return props.games.reduce((sum, g) => sum + (g.playtime_hours || 0), 0);
});

const mostPlayedGame = computed(() => {
  if (props.games.length === 0) return null;
  return [...props.games].sort((a, b) => b.playtime_forever - a.playtime_forever)[0];
});

function formatHours(hours: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(hours);
}
</script>
