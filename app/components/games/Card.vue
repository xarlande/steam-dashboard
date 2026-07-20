<template>
  <NuxtLinkLocale
    :to="`/game/${game.appid}`"
    class="group block h-full rounded-xl transition-all duration-300 hover:-translate-y-1.5"
    :class="category === GameTypes.Category.Story ? 'story-card-hover' : 'session-card-hover'"
  >
    <UiCard
      class="bg-card/45 flex h-full flex-col gap-0 overflow-hidden py-0 backdrop-blur-xs transition-all duration-300"
      :class="
        category === GameTypes.Category.Story
          ? 'group-hover:ring-2 group-hover:ring-cyan-400'
          : 'group-hover:ring-2 group-hover:ring-rose-500'
      "
    >
      <!-- Game Capsule Banner -->
      <div class="bg-muted relative aspect-[460/215] shrink-0 overflow-hidden">
        <img
          :src="game.header_img"
          :alt="game.name"
          loading="lazy"
          class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          @error="handleImageError"
        />
        <!-- Category Badge -->
        <UiBadge
          class="absolute top-2.5 right-2.5 rounded-md border px-2 py-0.5 text-[9px] font-black tracking-wider uppercase shadow-xs backdrop-blur-md transition-all duration-300"
          :class="
            category === GameTypes.Category.Story
              ? 'border-cyan-500/30 bg-cyan-950/85 text-cyan-300 hover:bg-cyan-950/85'
              : 'border-rose-500/30 bg-rose-950/85 text-rose-300 hover:bg-rose-950/85'
          "
        >
          {{ category === GameTypes.Category.Story ? "🎭 Story" : "🎮 Session" }}
        </UiBadge>
      </div>

      <!-- Game Details -->
      <UiCardContent class="flex flex-1 flex-col justify-between gap-4 p-4">
        <div>
          <h3
            class="text-foreground line-clamp-1 text-sm font-bold tracking-tight transition-colors sm:text-base"
            :class="
              category === GameTypes.Category.Story
                ? 'group-hover:text-cyan-600 dark:group-hover:text-cyan-400'
                : 'group-hover:text-rose-600 dark:group-hover:text-rose-400'
            "
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
            <span class="text-[10px] font-semibold tracking-wider text-cyan-600 dark:text-cyan-500 uppercase">
              {{ $t("index.recent") }}
            </span>
            <span class="mt-0.5 text-xs font-bold text-cyan-600 dark:text-cyan-400">
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
import { GameTypes, type SteamGame } from "~/types";

const props = defineProps<{
  game: SteamGame;
}>();

const { getGameCategory } = useGameCategories();
const category = computed(() => getGameCategory(props.game));

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

<style scoped>
.story-card-hover {
  box-shadow: 0 0 0 transparent;
}
.story-card-hover:hover {
  box-shadow: 0 12px 25px -4px rgba(34, 211, 238, 0.4);
}
.dark .story-card-hover:hover {
  box-shadow: 0 12px 25px -4px rgba(34, 211, 238, 0.3);
}

.session-card-hover {
  box-shadow: 0 0 0 transparent;
}
.session-card-hover:hover {
  box-shadow: 0 12px 25px -4px rgba(244, 63, 94, 0.4);
}
.dark .session-card-hover:hover {
  box-shadow: 0 12px 25px -4px rgba(244, 63, 94, 0.3);
}
</style>
