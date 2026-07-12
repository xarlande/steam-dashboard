<template>
  <UiCard class="group flex flex-col h-full game-card hover:-translate-y-1 relative">
    <!-- Game Capsule Banner -->
    <div class="relative aspect-[460/215] overflow-hidden shrink-0">
      <img
        :src="game.header_img"
        :alt="game.name"
        loading="lazy"
        class="w-full h-full object-cover game-card-img group-hover:scale-[1.03]"
        @error="handleImageError"
      />

      <!-- Subtle top gradient overlay -->
      <div
        class="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent opacity-60"
      ></div>

      <!-- App ID Badge (shadcn Badge) -->
      <UiBadge variant="secondary" class="absolute top-2.5 right-2.5">
        ID: {{ game.appid }}
      </UiBadge>

      <!-- Hover Actions overlay -->
      <div
        class="absolute inset-0 bg-neutral-950/85 opacity-0 group-hover:opacity-100 transition-opacity duration-100 flex flex-col items-center justify-center gap-3"
      >
        <UiButton as-child class="w-[80%]">
          <a :href="'steam://run/' + game.appid">
            <PlayIcon class="w-4 h-4 fill-current mr-2" />
            <span>{{ $t("index.playGame") }}</span>
          </a>
        </UiButton>

        <UiButton as-child variant="outline" class="w-[80%]">
          <NuxtLinkLocale :to="`/game/${game.appid}`">
            <StarIcon class="w-4 h-4 mr-2" />
            <span>{{ $t("index.achievements") }}</span>
          </NuxtLinkLocale>
        </UiButton>
      </div>
    </div>

    <!-- Game Details -->
    <UiCardContent class="flex flex-col flex-1 justify-between gap-4">
      <div>
        <h3
          class="font-bold text-sm sm:text-base text-foreground group-hover:text-cyan-500 dark:group-hover:text-cyan-300 line-clamp-1 transition-colors tracking-tight"
        >
          {{ game.name }}
        </h3>

        <div class="flex items-center gap-1.5 mt-2.5 text-xs text-muted-foreground font-medium">
          <ClockIcon class="w-3.5 h-3.5 text-muted-foreground" />
          <span>{{ $t("index.lastLaunched", { time: game.last_played_relative }) }}</span>
        </div>
      </div>

      <!-- Playtime Stats -->
      <div class="flex items-center justify-between pt-3 border-t border-border">
        <div class="flex flex-col">
          <span class="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{{
            $t("index.totalPlaytimeCard")
          }}</span>
          <span class="text-xs font-extrabold text-foreground mt-0.5">
            {{ formatHours(game.playtime_hours) }}
            <span class="text-[10px] font-medium text-muted-foreground">{{
              $t("common.hoursSuffix")
            }}</span>
          </span>
        </div>

        <!-- If played recently -->
        <div
          v-if="game.playtime_2weeks && game.playtime_2weeks > 0"
          class="flex flex-col items-end"
        >
          <span class="text-[10px] text-cyan-500 uppercase tracking-wider font-semibold">{{
            $t("index.recent")
          }}</span>
          <span class="text-xs font-bold text-cyan-400 mt-0.5">
            +{{ Math.round((game.playtime_2weeks / 60) * 10) / 10 }}
            {{ $t("common.hoursSuffix") }}
          </span>
        </div>
      </div>
    </UiCardContent>
  </UiCard>
</template>

<script lang="ts" setup>
import type { SteamGame } from "~/types";
import { ClockIcon, StarIcon, PlayIcon } from "@lucide/vue";

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
