<template>
  <div>
    <!-- Page Title -->
    <section class="animate-fade-in mb-8">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3">
          <div
            class="shrink-0 rounded-xl border border-violet-500/20 bg-violet-500/10 p-2.5 text-violet-600 dark:text-violet-400"
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

        <!-- Excluded Games Manager Trigger Button -->
        <div class="flex items-center gap-3">
          <UiButton
            variant="outline"
            size="sm"
            class="border-border/80 text-xs font-semibold shadow-xs transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
            @click="showExclusionsModal = true"
          >
            <EyeOffIcon class="mr-2 h-4 w-4 text-violet-500" />
            <span>{{ $t("analytics.excludedGamesBtn", { count: hiddenCount }) }}</span>
          </UiButton>
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
          <UiAlertTitle class="text-destructive mb-1 text-base leading-none font-extrabold">
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
              class="bg-card/25 border-border/60 relative flex flex-col items-center justify-center rounded-xl border p-5 md:col-span-2"
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
                      <span class="h-2.5 w-2.5 rounded-full bg-cyan-500"></span>
                      <span>{{ $t("analytics.legendStory") }}</span>
                    </div>
                    <span class="font-extrabold text-cyan-600 dark:text-cyan-400">
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
                    <span class="font-extrabold text-rose-600 dark:text-rose-400">
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

            <!-- Right Column (Top Games) - Takes 3 cols of 5 -->
            <div
              class="bg-card/25 border-border/60 flex flex-col justify-between rounded-xl border p-5 md:col-span-3"
            >
              <!-- Section Header with Limit Controls -->
              <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h3 class="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                  {{
                    topLimit === "all"
                      ? $t("analytics.topGamesTitleAll")
                      : $t("analytics.topGamesTitleWithLimit", { limit: topLimit })
                  }}
                </h3>

                <!-- Games Count Limit Selector -->
                <div class="flex items-center gap-2">
                  <span class="text-muted-foreground text-[11px] font-semibold">
                    {{ $t("analytics.topLimitLabel") }}
                  </span>
                  <div
                    class="bg-muted/60 border-border/50 flex items-center gap-0.5 rounded-xl border p-0.5"
                  >
                    <button
                      v-for="option in limitOptions"
                      :key="'limit-' + option"
                      type="button"
                      class="rounded-md px-2 py-0.5 text-[11px] font-bold transition-all"
                      :class="
                        topLimit === option
                          ? 'bg-background text-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      "
                      @click="topLimit = option"
                    >
                      {{ option === "all" ? $t("analytics.topLimitAll") : option }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Top Games List -->
              <div
                v-if="topGames.length === 0"
                class="text-muted-foreground flex flex-1 items-center justify-center py-10 text-xs font-medium"
              >
                {{ $t("analytics.legendNoData") }}
              </div>
              <div
                v-else
                class="flex flex-1 flex-col justify-start space-y-4 overflow-y-auto pr-1"
                :class="topGames.length > 5 ? 'max-h-[520px]' : ''"
              >
                <div
                  v-for="(game, index) in topGames"
                  :key="'top-' + game.appid"
                  class="group/bar flex items-center gap-3.5"
                >
                  <!-- Rank Indicator -->
                  <span
                    class="text-muted-foreground/60 w-4 shrink-0 text-center text-xs font-black select-none"
                  >
                    {{ index + 1 }}
                  </span>

                  <!-- Game Image banner -->
                  <div
                    class="bg-muted border-border/40 relative h-7 w-13 shrink-0 overflow-hidden rounded-md border shadow-xs"
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
                      <NuxtLinkLocale
                        :to="`/game/${game.appid}`"
                        class="text-foreground truncate font-bold transition-colors hover:text-violet-600 dark:hover:text-violet-400"
                        :title="game.name"
                      >
                        {{ game.name }}
                      </NuxtLinkLocale>

                      <div class="flex items-center gap-2">
                        <!-- Hours -->
                        <span class="text-foreground shrink-0 font-black">
                          {{ formatHours(game.display_hours) }}
                          <span class="text-muted-foreground text-[10px] font-semibold">{{
                            $t("common.hoursSuffix")
                          }}</span>
                        </span>

                        <!-- Quick Hide Action Button -->
                        <UiButton
                          variant="ghost"
                          size="icon"
                          class="h-6 w-6 opacity-0 transition-opacity group-hover/bar:opacity-100 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400"
                          :title="$t('analytics.hideFromAnalytics')"
                          @click="toggleGameHidden(game.appid, game.name)"
                        >
                          <EyeOffIcon class="h-3.5 w-3.5" />
                        </UiButton>
                      </div>
                    </div>

                    <!-- Progress bar track -->
                    <div
                      class="flex h-2 overflow-hidden rounded-full bg-neutral-200 shadow-inner dark:bg-neutral-800/80"
                    >
                      <div
                        class="h-full rounded-full bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-500 opacity-90 transition-all duration-1000 ease-out dark:from-violet-500 dark:via-indigo-500 dark:to-cyan-400"
                        :style="{ width: `${(game.display_hours / topMaxPlaytime) * 100}%` }"
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

    <!-- Exclusions Management Dialog -->
    <UiDialog v-model:open="showExclusionsModal">
      <UiDialogContent class="max-w-xl">
        <UiDialogHeader>
          <UiDialogTitle class="flex items-center gap-2 text-lg font-bold">
            <EyeOffIcon class="h-5 w-5 text-violet-500" />
            {{ $t("analytics.manageExcludedTitle") }}
          </UiDialogTitle>
          <UiDialogDescription class="text-xs">
            {{ $t("analytics.manageExcludedDesc") }}
          </UiDialogDescription>
        </UiDialogHeader>

        <!-- Search Bar -->
        <div class="relative mt-2">
          <SearchIcon class="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
          <UiInput
            v-model="exclusionsSearch"
            type="text"
            :placeholder="$t('analytics.searchGamesPlaceholder')"
            class="pl-9 text-xs"
          />
        </div>

        <!-- Excluded / All Games List -->
        <div class="max-h-[360px] space-y-2 overflow-y-auto py-2 pr-1">
          <div
            v-if="filteredGamesForExclusions.length === 0"
            class="text-muted-foreground py-8 text-center text-xs font-medium"
          >
            {{ $t("analytics.noExcludedGames") }}
          </div>

          <div
            v-for="game in filteredGamesForExclusions"
            :key="'excl-' + game.appid"
            class="bg-muted/30 border-border/60 flex items-center justify-between rounded-xl border p-2.5 transition-colors"
          >
            <div class="flex min-w-0 flex-1 items-center gap-3 pr-2">
              <img
                :src="game.header_img"
                :alt="game.name"
                class="border-border/40 h-7 w-13 shrink-0 rounded-md border object-cover"
                @error="handleImageError"
              />
              <div class="min-w-0">
                <h4 class="text-foreground truncate text-xs font-bold" :title="game.name">
                  {{ game.name }}
                </h4>
                <p class="text-muted-foreground mt-0.5 text-[10px] font-medium">
                  {{ formatHours(game.playtime_hours) }} {{ $t("common.hoursSuffix") }}
                </p>
              </div>
            </div>

            <!-- Hide / Unhide Toggle Switch -->
            <UiButton
              variant="outline"
              size="sm"
              class="h-8 shrink-0 text-xs font-bold transition-all"
              :class="
                isGameHidden(game.appid)
                  ? 'border-rose-500/30 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 dark:text-rose-400'
                  : 'border-border text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800'
              "
              @click="toggleGameHidden(game.appid, game.name)"
            >
              <EyeOffIcon v-if="isGameHidden(game.appid)" class="mr-1.5 h-3.5 w-3.5" />
              <EyeIcon v-else class="mr-1.5 h-3.5 w-3.5" />
              <span>
                {{
                  isGameHidden(game.appid)
                    ? $t("analytics.hideFromAnalytics")
                    : $t("analytics.showInAnalytics")
                }}
              </span>
            </UiButton>
          </div>
        </div>

        <UiDialogFooter>
          <UiButton variant="outline" size="sm" @click="showExclusionsModal = false">
            {{ $t("common.close") }}
          </UiButton>
        </UiDialogFooter>
      </UiDialogContent>
    </UiDialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { BarChart2Icon, AlertCircleIcon, EyeOffIcon, EyeIcon, SearchIcon } from "@lucide/vue";
import type { TopGamesLimit } from "~/composables/useAnalytics";

definePageMeta({
  showBackButton: true,
});

const { games, isLoading, error, fetchGames, suspense } = useGameLibrary();
await suspense();

const { isGameHidden, toggleGameHidden, hiddenCount } = useAnalyticsExclusions();

// Analytics period state
const analyticsPeriod = ref<"recent" | "allTime">("recent");

// Analytics top limit state (5, 10, 15, 20, "all")
const topLimit = ref<TopGamesLimit>(5);
const limitOptions: TopGamesLimit[] = [5, 10, 15, 20, "all"];

// Analytics composable calculations
const {
  activeStoryHours,
  activeSessionHours,
  activeTotalHours,
  activeStoryPercent,
  activeSessionPercent,
  donutStoryDash,
  donutSessionDash,
  donutSessionOffset,
  topGames,
  topMaxPlaytime,
} = useAnalytics(games, analyticsPeriod, topLimit);

// Exclusions Dialog State
const showExclusionsModal = ref(false);
const exclusionsSearch = ref("");

const filteredGamesForExclusions = computed(() => {
  const copy = [...games.value];
  const sort = copy.sort((a, b) => {
    if (!isGameHidden(a.appid) && isGameHidden(b.appid)) {
      return 1;
    }
    if (isGameHidden(a.appid) && !isGameHidden(b.appid)) {
      return -1;
    }
    return 0;
  });

  if (!exclusionsSearch.value.trim()) {
    return sort;
  }
  const query = exclusionsSearch.value.toLowerCase().trim();
  return sort.filter((g) => g.name.toLowerCase().includes(query));
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
</style>
