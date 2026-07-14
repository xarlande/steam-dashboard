<template>
  <!-- Page Title -->
  <section class="mb-8 animate-fade-in">
    <div class="flex items-center gap-3">
      <div
        class="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 shrink-0"
      >
        <BarChart2Icon class="w-8 h-8" />
      </div>
      <div>
        <h1
          class="text-2xl sm:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r dark:from-neutral-50 dark:via-neutral-100 dark:to-neutral-400 from-neutral-900 via-neutral-800 to-neutral-600"
        >
          {{ $t("analytics.title") }}
        </h1>
        <p class="text-xs sm:text-sm text-muted-foreground font-medium">
          {{ $t("analytics.description") }}
        </p>
      </div>
    </div>
  </section>

  <!-- Loader State -->
  <section v-if="isLoading" class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-5 gap-8">
      <UiCard class="md:col-span-2 h-80 animate-pulse bg-muted/40" />
      <UiCard class="md:col-span-3 h-80 animate-pulse bg-muted/40" />
    </div>
  </section>

  <!-- Error State -->
  <section v-else-if="error" class="max-w-2xl mx-auto py-8">
    <div
      class="p-6 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive-foreground text-sm flex items-start gap-4 shadow-lg"
    >
      <AlertCircleIcon class="w-6 h-6 text-destructive shrink-0 mt-0.5" />
      <div class="flex-1">
        <h3 class="font-extrabold text-base text-destructive mb-1">Failed to Load Analytics</h3>
        <p class="leading-relaxed">{{ error }}</p>
        <div class="mt-4 flex items-center gap-3">
          <UiButton variant="outline" as-child>
            <NuxtLinkLocale to="/"> &larr; Configure Settings </NuxtLinkLocale>
          </UiButton>
          <UiButton variant="outline" @click="fetchGames"> Retry </UiButton>
        </div>
      </div>
    </div>
  </section>

  <!-- Loaded Analytics State -->
  <section v-else class="space-y-8 animate-fade-in">
    <UiCard class="overflow-hidden bg-gradient-to-br from-card to-card/50">
      <UiCardContent class="p-6">
        <!-- Period Selector Row -->
        <div class="flex items-center justify-between pb-4 border-b border-border/60">
          <h2 class="text-sm font-bold text-muted-foreground uppercase tracking-widest">
            {{ $t("analytics.title") }}
          </h2>

          <!-- Period Toggle Switch -->
          <div
            class="flex items-center bg-muted/65 p-1 rounded-xl border border-border/65 shadow-inner"
          >
            <button
              @click="analyticsPeriod = 'recent'"
              class="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
              :class="
                analyticsPeriod === 'recent'
                  ? 'bg-card text-foreground shadow-xs border border-border/30'
                  : 'text-muted-foreground hover:text-foreground'
              "
            >
              {{ $t("analytics.toggleRecent") }}
            </button>
            <button
              @click="analyticsPeriod = 'allTime'"
              class="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
              :class="
                analyticsPeriod === 'allTime'
                  ? 'bg-card text-foreground shadow-xs border border-border/30'
                  : 'text-muted-foreground hover:text-foreground'
              "
            >
              {{ $t("analytics.toggleAllTime") }}
            </button>
          </div>
        </div>

        <!-- Content Grid -->
        <div class="grid grid-cols-1 md:grid-cols-5 gap-8 pt-6">
          <!-- Left Column (Donut Chart) - Takes 2 cols of 5 -->
          <div
            class="md:col-span-2 flex flex-col items-center justify-center p-5 rounded-2xl bg-card/25 border border-border/60 relative"
          >
            <h3
              class="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6 self-start"
            >
              {{ $t("analytics.balanceTitle") }}
            </h3>

            <!-- SVG Donut Chart container -->
            <div class="relative w-44 h-44 flex items-center justify-center select-none">
              <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <!-- Base background circle (if hours = 0) -->
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  stroke-width="10"
                  fill="transparent"
                  class="text-neutral-100 dark:text-neutral-850"
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
                  class="transition-all duration-1000 ease-out donut-segment"
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
                  class="transition-all duration-1000 ease-out donut-segment"
                />
              </svg>

              <!-- Center Text Overlay -->
              <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span class="text-2xl font-black tracking-tight text-foreground"
                  >{{ activeStoryPercent }}%</span
                >
                <span
                  class="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5"
                  >🎭 Story</span
                >
              </div>
            </div>

            <!-- Legend details -->
            <div class="w-full mt-6 space-y-2.5 pt-4 border-t border-border/60">
              <div
                v-if="activeTotalHours === 0"
                class="text-center text-xs text-muted-foreground py-2 font-medium"
              >
                {{ $t("analytics.legendNoData") }}
              </div>
              <template v-else>
                <!-- Story Legend -->
                <div class="flex items-center justify-between text-xs">
                  <div class="flex items-center gap-2 font-semibold text-foreground/90">
                    <span class="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
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
                  <div class="flex items-center gap-2 font-semibold text-foreground/90">
                    <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
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
            class="md:col-span-3 flex flex-col justify-between p-5 rounded-2xl bg-card/25 border border-border/60"
          >
            <h3 class="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-5">
              {{ $t("analytics.topGamesTitle") }}
            </h3>

            <div
              v-if="topFiveGames.length === 0"
              class="flex-1 flex items-center justify-center text-xs text-muted-foreground py-10 font-medium"
            >
              {{ $t("analytics.legendNoData") }}
            </div>
            <div v-else class="space-y-4.5 flex-1 flex flex-col justify-center">
              <div
                v-for="(game, index) in topFiveGames"
                :key="'top-' + game.appid"
                class="flex items-center gap-3.5 group/bar"
              >
                <!-- Rank Indicator -->
                <span
                  class="text-xs font-black text-muted-foreground/60 w-3.5 select-none text-center"
                >
                  {{ index + 1 }}
                </span>

                <!-- Game Image banner -->
                <div
                  class="relative w-12 h-6 rounded-md overflow-hidden bg-muted border border-border/40 shrink-0 shadow-xs"
                >
                  <img
                    :src="game.header_img"
                    :alt="game.name"
                    class="w-full h-full object-cover transition-transform group-hover/bar:scale-105"
                    @error="handleImageError"
                  />
                </div>

                <!-- Bar & details -->
                <div class="flex-1 min-w-0 space-y-1">
                  <div class="flex items-center justify-between text-xs gap-2">
                    <h4
                      class="font-bold text-foreground truncate group-hover/bar:text-violet-400 transition-colors"
                      :title="game.name"
                    >
                      {{ game.name }}
                    </h4>
                    <span class="font-black text-foreground shrink-0 pl-2">
                      {{ formatHours(game.display_hours) }}
                      <span class="text-[10px] text-muted-foreground font-semibold">{{
                        $t("common.hoursSuffix")
                      }}</span>
                    </span>
                  </div>

                  <!-- Progress bar track -->
                  <div
                    class="h-2 rounded-full bg-neutral-200 dark:bg-neutral-800/80 overflow-hidden shadow-inner flex"
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
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from "vue";
import { ArrowLeftIcon, BarChart2Icon, AlertCircleIcon } from "@lucide/vue";
import { GameTypes } from "@/types";
import type { SteamGame } from "@/types";

definePageMeta({
  showBackButton: true,
});

const { locale, t } = useI18n();

const { games, isLoading, error, loadCredentials, fetchGames } = useGameLibrary();

// Watch locale changes to automatically refetch games
watch(locale, () => {
  fetchGames();
});

const manualCategories = ref<Record<number, GameTypes.Category>>({});

// Game list categorization constants
const SESSION_GAME_KEYWORDS = [
  "counter-strike",
  "cs:go",
  "cs2",
  "dota",
  "league of legends",
  "valorant",
  "apex legends",
  "pubg",
  "fortnite",
  "overwatch",
  "war thunder",
  "world of tanks",
  "world of warships",
  "team fortress",
  "rust",
  "dayz",
  "rainbow six",
  "destiny",
  "warframe",
  "helldivers",
  "gta online",
  "dead by daylight",
  "rocket league",
  "fifa",
  "madden",
  "nba 2k",
  "street fighter",
  "tekken",
  "mortal kombat",
  "brawlhalla",
  "among us",
  "phasmophobia",
  "lethal company",
  "roblox",
  "minecraft",
  "payday",
  "left 4 dead",
  "killing floor",
  "deep rock galactic",
  "hearthstone",
  "magic: the gathering",
  "yu-gi-oh",
  "tft",
  "teamfight tactics",
  "diablo",
  "path of exile",
  "lost ark",
  "world of warcraft",
  "guild wars",
  "final fantasy xiv",
  "lineage",
  "black desert",
  "heartstone",
  "call of duty",
  "battlefield",
  "apex",
  "pubg",
  "deadlock",
  "brawl stars",
  "clash",
];

function isDefaultSessionGame(name: string): boolean {
  const lowercaseName = name.toLowerCase();
  return SESSION_GAME_KEYWORDS.some((keyword) => lowercaseName.includes(keyword));
}

function getGameCategory(game: SteamGame): GameTypes.Category {
  const manual = manualCategories.value[game.appid];
  if (manual) {
    return manual;
  }
  return isDefaultSessionGame(game.name) ? GameTypes.Category.Session : GameTypes.Category.Story;
}

onMounted(() => {
  loadCredentials();

  if (import.meta.client) {
    const savedCats = localStorage.getItem("steam_game_categories");
    if (savedCats) {
      try {
        manualCategories.value = JSON.parse(savedCats);
      } catch (e) {
        console.error("Error loading manual categories:", e);
      }
    }
  }

  fetchGames();
});

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
