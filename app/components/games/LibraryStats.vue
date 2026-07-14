<template>
  <section
    v-if="games.length > 0"
    class="animate-fade-in mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3"
  >
    <!-- Stat Card 1: Total Games -->
    <UiCard class="bg-card/45 border-border/50 relative overflow-hidden">
      <UiCardContent class="p-6">
        <div class="absolute -right-4 -bottom-4 text-cyan-400 opacity-10">
          <Gamepad2Icon class="h-24 w-24" />
        </div>
        <p class="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          {{ $t("index.stats.totalGames") }}
        </p>
        <p class="mt-2 text-3xl font-extrabold tracking-tight">{{ totalCount }}</p>
        <p class="text-muted-foreground/85 mt-1 text-xs">
          {{ $t("index.stats.totalGamesDesc") }}
        </p>
      </UiCardContent>
    </UiCard>

    <!-- Stat Card 2: Total Time -->
    <UiCard class="bg-card/45 border-border/50 relative overflow-hidden">
      <UiCardContent class="p-6">
        <div class="absolute -right-4 -bottom-4 text-violet-400 opacity-10">
          <ClockIcon class="h-24 w-24" />
        </div>
        <p class="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          {{ $t("index.stats.totalPlaytime") }}
        </p>
        <p class="mt-2 text-3xl font-extrabold tracking-tight">
          {{ formatHours(totalHours) }}
          <span class="text-muted-foreground text-sm font-semibold">
            {{ $t("common.hoursSuffix") }}
          </span>
        </p>
        <p class="text-muted-foreground/85 mt-1 text-xs">
          {{ $t("index.stats.totalPlaytimeDesc") }}
        </p>
      </UiCardContent>
    </UiCard>

    <!-- Stat Card 3: Most Played -->
    <UiCard class="bg-card/45 border-border/50 relative overflow-hidden">
      <UiCardContent class="p-6">
        <div class="absolute -right-4 -bottom-4 text-indigo-400 opacity-10">
          <StarIcon class="h-24 w-24" />
        </div>
        <p class="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          {{ $t("index.stats.mostPlayed") }}
        </p>
        <p class="mt-2 truncate pr-16 text-xl font-extrabold tracking-tight">
          {{ mostPlayedGame?.name || $t("index.stats.none") }}
        </p>
        <p class="mt-1 text-xs font-semibold text-indigo-400">
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
