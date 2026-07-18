<template>
  <div>
    <!-- Page Title -->
    <section class="animate-fade-in mb-8">
      <div class="flex items-center gap-3">
        <div
          class="shrink-0 rounded-xl border border-violet-500/20 bg-violet-500/10 p-2.5 text-violet-400"
        >
          <BarChart2Icon class="h-8 w-8" />
        </div>
        <div>
          <h1
            class="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-600 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent sm:text-3xl dark:from-neutral-50 dark:via-neutral-100 dark:to-neutral-400"
          >
            {{ $t("analytics.title") }}
          </h1>
          <p class="text-muted-foreground text-xs font-medium sm:text-sm">
            {{ $t("analytics.description") }}
          </p>
        </div>
      </div>
    </section>

    <!-- Loader State -->
    <section v-if="isLoading" class="space-y-6">
      <div class="grid grid-cols-1 gap-8 md:grid-cols-5">
        <UiCard class="bg-muted/40 h-80 animate-pulse md:col-span-2" />
        <UiCard class="bg-muted/40 h-80 animate-pulse md:col-span-3" />
      </div>
    </section>

    <!-- Error State -->
    <section v-else-if="error" class="mx-auto max-w-2xl py-8">
      <UiAlert
        variant="destructive"
        class="border-destructive/20 bg-destructive/10 text-destructive-foreground p-6 shadow-lg"
      >
        <AlertCircleIcon class="h-5 w-5" />
        <div class="flex-1">
          <UiAlertTitle class="text-destructive mb-1 text-base font-extrabold leading-none">
            Failed to Load Analytics
          </UiAlertTitle>
          <UiAlertDescription class="leading-relaxed">
            <p class="mt-1">{{ error }}</p>
            <div class="mt-4 flex items-center gap-3">
              <UiButton variant="outline" as-child>
                <NuxtLinkLocale to="/"> &larr; Configure Settings </NuxtLinkLocale>
              </UiButton>
              <UiButton variant="outline" @click="fetchGames"> Retry </UiButton>
            </div>
          </UiAlertDescription>
        </div>
      </UiAlert>
    </section>

    <!-- Loaded Analytics State -->
    <section v-else class="animate-fade-in space-y-8">
      <UiCard class="from-card to-card/50 overflow-hidden bg-gradient-to-br">
        <UiCardContent class="p-6">
          <!-- Period Selector Row -->
          <div class="border-border/60 flex items-center justify-between border-b pb-4">
            <h2 class="text-muted-foreground text-sm font-bold tracking-widest uppercase">
              {{ $t("analytics.title") }}
            </h2>

            <!-- Period Toggle Switch -->
            <UiTabs v-model="analyticsPeriod" class="w-auto">
              <UiTabsList>
                <UiTabsTrigger value="recent">
                  {{ $t("analytics.toggleRecent") }}
                </UiTabsTrigger>
                <UiTabsTrigger value="allTime">
                  {{ $t("analytics.toggleAllTime") }}
                </UiTabsTrigger>
              </UiTabsList>
            </UiTabs>
          </div>

          <!-- Content Grid -->
          <div class="grid grid-cols-1 gap-8 pt-6 md:grid-cols-5">
            <!-- Left Column (Donut Chart) - Takes 2 cols of 5 -->
            <div
              class="bg-card/25 border-border/60 relative flex flex-col items-center justify-center rounded-2xl border p-5 md:col-span-2"
            >
              <h3
                class="text-muted-foreground mb-6 self-start text-xs font-bold tracking-widest uppercase"
              >
                {{ $t("analytics.balanceTitle") }}
              </h3>

              <!-- SVG Donut Chart container -->
              <div class="relative flex h-44 w-44 items-center justify-center select-none">
                <svg class="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                  <!-- Base background circle (if hours = 0) -->
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    stroke-width="10"
                    fill="transparent"
                    class="dark:text-neutral-850 text-neutral-100"
                  />

                  <!-- Story Segment -->
                  <circle
                    v-if="activeTotalHours > 0"
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#22d3ee"
                    stroke-width="10.5"
                    fill="transparent"
                    :stroke-dasharray="donutStoryDash"
                    stroke-dashoffset="0"
                    class="donut-segment transition-all duration-1000 ease-out"
                  />

                  <!-- Session Segment -->
                  <circle
                    v-if="activeTotalHours > 0 && activeSessionPercent > 0"
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#f43f5e"
                    stroke-width="10.5"
                    fill="transparent"
                    :stroke-dasharray="donutSessionDash"
                    :stroke-dashoffset="donutSessionOffset"
                    class="donut-segment transition-all duration-1000 ease-out"
                  />
                </svg>

                <!-- Center Text Overlay -->
                <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span class="text-foreground text-2xl font-black tracking-tight"
                    >{{ activeStoryPercent }}%</span
                  >
                  <span
                    class="text-muted-foreground mt-0.5 text-[9px] font-bold tracking-wider uppercase"
                    >🎭 Story</span
                  >
                </div>
              </div>

              <!-- Legend details -->
              <div class="border-border/60 mt-6 w-full space-y-2.5 border-t pt-4">
                <div
                  v-if="activeTotalHours === 0"
                  class="text-muted-foreground py-2 text-center text-xs font-medium"
                >
                  {{ $t("analytics.legendNoData") }}
                </div>
                <template v-else>
                  <!-- Story Legend -->
                  <div class="flex items-center justify-between text-xs">
                    <div class="text-foreground/90 flex items-center gap-2 font-semibold">
                      <span class="h-2.5 w-2.5 rounded-full bg-cyan-400"></span>
                      <span>{{ $t("analytics.legendStory") }}</span>
                    </div>
                    <span class="font-extrabold text-cyan-400">
                      {{
                        $t("analytics.legendHours", {
                          hours: formatHours(activeStoryHours),
                          percent: activeStoryPercent,
                        })
                      }}
                    </span>
                  </div>

                  <!-- Session Legend -->
                  <div class="flex items-center justify-between text-xs">
                    <div class="text-foreground/90 flex items-center gap-2 font-semibold">
                      <span class="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
                      <span>{{ $t("analytics.legendSession") }}</span>
                    </div>
                    <span class="font-extrabold text-rose-400">
                      {{
                        $t("analytics.legendHours", {
                          hours: formatHours(activeSessionHours),
                          percent: activeSessionPercent,
                        })
                      }}
                    </span>
                  </div>
                </template>
              </div>
            </div>

            <!-- Right Column (Top 5 Games) - Takes 3 cols of 5 -->
            <div
              class="bg-card/25 border-border/60 flex flex-col justify-between rounded-2xl border p-5 md:col-span-3"
            >
              <h3 class="text-muted-foreground mb-5 text-xs font-bold tracking-widest uppercase">
                {{ $t("analytics.topGamesTitle") }}
              </h3>

              <div
                v-if="topFiveGames.length === 0"
                class="text-muted-foreground flex flex-1 items-center justify-center py-10 text-xs font-medium"
              >
                {{ $t("analytics.legendNoData") }}
              </div>
              <div v-else class="flex flex-1 flex-col justify-center space-y-4.5">
                <div
                  v-for="(game, index) in topFiveGames"
                  :key="'top-' + game.appid"
                  class="group/bar flex items-center gap-3.5"
                >
                  <!-- Rank Indicator -->
                  <span
                    class="text-muted-foreground/60 w-3.5 text-center text-xs font-black select-none"
                  >
                    {{ index + 1 }}
                  </span>

                  <!-- Game Image banner -->
                  <div
                    class="bg-muted border-border/40 relative h-6 w-12 shrink-0 overflow-hidden rounded-md border shadow-xs"
                  >
                    <img
                      :src="game.header_img"
                      :alt="game.name"
                      class="h-full w-full object-cover transition-transform group-hover/bar:scale-105"
                      @error="handleImageError"
                    />
                  </div>

                  <!-- Bar & details -->
                  <div class="min-w-0 flex-1 space-y-1">
                    <div class="flex items-center justify-between gap-2 text-xs">
                      <h4
                        class="text-foreground truncate font-bold transition-colors group-hover/bar:text-violet-400"
                        :title="game.name"
                      >
                        {{ game.name }}
                      </h4>
                      <span class="text-foreground shrink-0 pl-2 font-black">
                        {{ formatHours(game.display_hours) }}
                        <span class="text-muted-foreground text-[10px] font-semibold">{{
                          $t("common.hoursSuffix")
                        }}</span>
                      </span>
                    </div>

                    <!-- Progress bar track -->
                    <div
                      class="flex h-2 overflow-hidden rounded-full bg-neutral-200 shadow-inner dark:bg-neutral-800/80"
                    >
                      <div
                        class="h-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 opacity-90 transition-all duration-1000 ease-out"
                        :style="{ width: `${(game.display_hours / topFiveMaxPlaytime) * 100}%` }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </UiCardContent>
      </UiCard>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from "vue";
import { ArrowLeftIcon, BarChart2Icon, AlertCircleIcon } from "@lucide/vue";
import { GameTypes } from "@/types";
import type { SteamGame } from "@/types";

definePageMeta({
  showBackButton: true,
});

const { locale, t } = useI18n();

const { games, isLoading, error, fetchGames, suspense } = useGameLibrary();
await suspense();

const { getGameCategory } = useGameCategories();

// Analytics calculations
const analyticsPeriod = ref<"recent" | "allTime">("recent");

// Recently played games computed values
const recentlyPlayedGames = computed(() => {
  return games.value.filter((g) => g.playtime_2weeks && g.playtime_2weeks > 0);
});

const recentStoryMinutes = computed(() => {
  return recentlyPlayedGames.value.reduce(
    (sum, g) =>
      getGameCategory(g) === GameTypes.Category.Story ? sum + (g.playtime_2weeks || 0) : sum,
    0,
  );
});

const recentSessionMinutes = computed(() => {
  return recentlyPlayedGames.value.reduce(
    (sum, g) =>
      getGameCategory(g) === GameTypes.Category.Session ? sum + (g.playtime_2weeks || 0) : sum,
    0,
  );
});

const recentTotalMinutes = computed(() => {
  return recentStoryMinutes.value + recentSessionMinutes.value;
});

const recentStoryHours = computed(() => Math.round((recentStoryMinutes.value / 60) * 10) / 10);
const recentSessionHours = computed(() => Math.round((recentSessionMinutes.value / 60) * 10) / 10);
const recentTotalHours = computed(() => Math.round((recentTotalMinutes.value / 60) * 10) / 10);

// All time computed values
const allTimeStoryHours = computed(() => {
  const mins = games.value.reduce(
    (sum, g) => (getGameCategory(g) === GameTypes.Category.Story ? sum + g.playtime_forever : sum),
    0,
  );
  return Math.round((mins / 60) * 10) / 10;
});

const allTimeSessionHours = computed(() => {
  const mins = games.value.reduce(
    (sum, g) =>
      getGameCategory(g) === GameTypes.Category.Session ? sum + g.playtime_forever : sum,
    0,
  );
  return Math.round((mins / 60) * 10) / 10;
});

const allTimeTotalHours = computed(() => {
  return Math.round((allTimeStoryHours.value + allTimeSessionHours.value) * 10) / 10;
});

// Active computed hours & percentage metrics
const activeStoryHours = computed(() => {
  return analyticsPeriod.value === "recent" ? recentStoryHours.value : allTimeStoryHours.value;
});

const activeSessionHours = computed(() => {
  return analyticsPeriod.value === "recent" ? recentSessionHours.value : allTimeSessionHours.value;
});

const activeTotalHours = computed(() => {
  return analyticsPeriod.value === "recent" ? recentTotalHours.value : allTimeTotalHours.value;
});

const activeStoryPercent = computed(() => {
  if (activeTotalHours.value === 0) return 0;
  return Math.round((activeStoryHours.value / activeTotalHours.value) * 100);
});

const activeSessionPercent = computed(() => {
  if (activeTotalHours.value === 0) return 0;
  return 100 - activeStoryPercent.value;
});

// SVG Donut Calculations
const donutCircumference = 251.327;

const donutStoryDash = computed(() => {
  const value = (activeStoryPercent.value / 100) * donutCircumference;
  return `${value} ${donutCircumference}`;
});

const donutSessionDash = computed(() => {
  const value = (activeSessionPercent.value / 100) * donutCircumference;
  return `${value} ${donutCircumference}`;
});

const donutSessionOffset = computed(() => {
  return -((activeStoryPercent.value / 100) * donutCircumference);
});

// Dynamic Top 5 Games
const topFiveGames = computed(() => {
  if (games.value.length === 0) return [];

  if (analyticsPeriod.value === "recent") {
    const playedRecent = games.value.filter((g) => g.playtime_2weeks && g.playtime_2weeks > 0);
    const sorted = [...playedRecent]
      .sort((a, b) => (b.playtime_2weeks || 0) - (a.playtime_2weeks || 0))
      .slice(0, 5);

    return sorted.map((g) => {
      const recentHours = Math.round(((g.playtime_2weeks || 0) / 60) * 10) / 10;
      return Object.assign({}, g, { display_hours: recentHours });
    });
  } else {
    const sorted = [...games.value]
      .sort((a, b) => b.playtime_forever - a.playtime_forever)
      .slice(0, 5);

    return sorted.map((g) => {
      return Object.assign({}, g, { display_hours: g.playtime_hours });
    });
  }
});

const topFiveMaxPlaytime = computed(() => {
  if (topFiveGames.value.length === 0) return 1;
  return topFiveGames.value[0]?.display_hours || 1;
});

function formatHours(hours: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(hours);
}

function handleImageError(event: Event) {
  const target = event.target as HTMLImageElement;
  if (target) {
    target.src =
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=460&h=215";
  }
}
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.donut-segment {
  transform-origin: center;
  transition:
    stroke-dasharray 0.8s cubic-bezier(0.16, 1, 0.3, 1),
    stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
