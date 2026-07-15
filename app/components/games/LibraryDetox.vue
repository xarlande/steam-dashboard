<template>
  <section v-if="games.length > 0" class="animate-fade-in mb-8">
    <UiCard
      :class="detoxCardClass"
      class="bg-card/45 border-border/50 overflow-hidden border backdrop-blur-md transition-all duration-500"
    >
      <UiCardContent class="p-6">
        <!-- Header Row -->
        <div
          class="border-border/60 flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="flex items-center gap-3">
            <div
              class="shrink-0 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-2.5 text-cyan-400"
            >
              <ShieldIcon class="h-6 w-6" />
            </div>
            <div>
              <h2 class="text-foreground text-lg font-bold tracking-tight sm:text-xl">
                {{ $t("detox.title") }}
              </h2>
              <p class="text-muted-foreground mt-0.5 text-xs font-medium">
                {{ $t("detox.description") }}
              </p>
            </div>
          </div>

          <!-- Status Badge -->
          <div class="flex items-center gap-2 self-start sm:self-auto">
            <span class="text-muted-foreground text-xs font-semibold tracking-wider uppercase"
              >{{ $t("detox.statusLabel") }}:</span
            >
            <UiBadge
              :class="hygieneBadgeClass"
              class="rounded-lg border px-3 py-1 text-xs font-bold transition-all duration-300"
            >
              {{ $t("detox.states." + hygieneStatus + ".title") }}
            </UiBadge>
          </div>
        </div>

        <!-- Content Grid -->
        <div class="grid grid-cols-1 gap-6 pt-6 md:grid-cols-3">
          <!-- Left Column: Advice Box and Progress Scale -->
          <div class="flex flex-col justify-between gap-6 md:col-span-2">
            <!-- Recommendations/Hygienic advice -->
            <div
              class="flex items-start gap-4 rounded-2xl border p-4 transition-all duration-300 sm:p-5"
              :class="adviceBoxClass"
            >
              <span class="shrink-0 text-3xl select-none">
                <span v-if="hygieneStatus === 'critical'">🚨</span>
                <span v-else-if="hygieneStatus === 'poor'">⚠️</span>
                <span v-else-if="hygieneStatus === 'balanced'">⚖️</span>
                <span v-else-if="hygieneStatus === 'excellent'">✨</span>
                <span v-else>🌱</span>
              </span>
              <div>
                <h4
                  class="mb-1 text-sm font-extrabold tracking-tight tracking-wide uppercase opacity-90"
                >
                  {{ $t("detox.tipsTitle") }}
                </h4>
                <p class="text-sm leading-relaxed font-semibold opacity-95">
                  {{ $t("detox.states." + hygieneStatus + ".desc") }}
                </p>

                <!-- Roulette Trigger Button -->
                <div
                  v-if="hygieneStatus === 'critical' || hygieneStatus === 'poor'"
                  class="mt-3.5 animate-bounce"
                >
                  <UiButton
                    size="sm"
                    class="flex items-center gap-1.5 border-0 bg-rose-600 text-xs font-extrabold text-white shadow-lg shadow-rose-900/10 transition-all duration-300 hover:bg-rose-500 active:scale-95"
                    @click="showRouletteModal = true"
                  >
                    <span>🔮</span>
                    <span>{{ $t("roulette.btn") }}</span>
                  </UiButton>
                </div>
              </div>
            </div>

            <!-- Progress Bar / Scale -->
            <div class="space-y-3.5">
              <div
                class="text-muted-foreground flex items-center justify-between text-xs font-semibold"
              >
                <span class="flex items-center gap-1.5"
                  ><span class="h-2.5 w-2.5 rounded-full bg-rose-500"></span> 🎮
                  {{ $t("detox.sessionLabel") }}</span
                >
                <span class="text-foreground text-sm font-black"
                  >{{ storyPercentage }}% {{ $t("detox.storyRatio") }}</span
                >
                <span class="flex items-center gap-1.5"
                  ><span class="h-2.5 w-2.5 rounded-full bg-cyan-400"></span> 🎭
                  {{ $t("detox.storyLabel") }}</span
                >
              </div>

              <UiProgress
                :model-value="storyPercentage"
                class="h-3.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800/80"
                :class="'progress-' + hygieneStatus"
              />

              <div
                class="text-muted-foreground/80 flex items-center justify-between text-[10px] font-bold tracking-wider uppercase"
              >
                <span>100% {{ $t("detox.sessionLabel") }}</span>
                <span>50/50 Balance</span>
                <span>100% {{ $t("detox.storyLabel") }}</span>
              </div>
            </div>
          </div>

          <!-- Right Column: Recent Playtime Summary & Toggle -->
          <div
            class="bg-card/30 border-border/80 flex flex-col justify-between gap-6 rounded-2xl border p-5"
          >
            <div class="space-y-4">
              <h3 class="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                {{ $t("detox.recentPlaytime") }}
              </h3>

              <div class="space-y-3">
                <!-- Total Recent Time -->
                <div class="border-border/60 flex items-baseline justify-between border-b pb-2.5">
                  <span class="text-muted-foreground text-sm font-semibold">Total</span>
                  <span class="text-foreground text-2xl font-black"
                    >{{ formatHours(recentTotalHours) }}
                    <span class="text-muted-foreground text-xs font-semibold">{{
                      $t("common.hoursSuffix")
                    }}</span></span
                  >
                </div>

                <!-- Story Hours -->
                <div class="flex items-center justify-between">
                  <span class="text-muted-foreground text-xs font-semibold">{{
                    $t("detox.storyLabel")
                  }}</span>
                  <span class="text-sm font-bold text-cyan-400"
                    >{{ formatHours(recentStoryHours) }} {{ $t("common.hoursSuffix") }}</span
                  >
                </div>

                <!-- Session Hours -->
                <div class="flex items-center justify-between">
                  <span class="text-muted-foreground text-xs font-semibold">{{
                    $t("detox.sessionLabel")
                  }}</span>
                  <span class="text-sm font-bold text-rose-500"
                    >{{ formatHours(recentSessionHours) }} {{ $t("common.hoursSuffix") }}</span
                  >
                </div>
              </div>
            </div>

            <!-- Customizer Toggle Button -->
            <UiButton
              v-if="recentlyPlayedGames.length > 0"
              variant="outline"
              size="sm"
              class="w-full text-xs font-semibold transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
              @click="showCategorizer = !showCategorizer"
            >
              <SettingsIcon class="mr-2 h-4 w-4" />
              <span>{{
                showCategorizer ? $t("detox.hideCategorizer") : $t("detox.showCategorizer")
              }}</span>
            </UiButton>
          </div>
        </div>

        <!-- Game Categorizer (Collapsible Panel) -->
        <transition name="slide-fade">
          <div
            v-if="showCategorizer && recentlyPlayedGames.length > 0"
            class="border-border/60 mt-6 border-t pt-6"
          >
            <div class="mb-4">
              <h3 class="text-foreground text-sm font-bold">{{ $t("detox.customizeHeader") }}</h3>
              <p class="text-muted-foreground mt-0.5 text-xs font-medium">
                {{ $t("detox.customizeDesc") }}
              </p>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              <div
                v-for="game in recentlyPlayedGames"
                :key="'cat-' + game.appid"
                class="bg-card/30 flex items-center justify-between rounded-2xl border p-3 transition-all duration-300"
                :class="
                  getGameCategory(game) === 'story'
                    ? 'border-border/60 hover:border-cyan-500/35 hover:shadow-[0_2px_10px_rgba(6,182,212,0.06)]'
                    : 'border-border/60 hover:border-rose-500/35 hover:shadow-[0_2px_10px_rgba(244,63,94,0.06)]'
                "
              >
                <div class="flex min-w-0 flex-1 items-center gap-3 pr-2">
                  <!-- Small game banner -->
                  <img
                    :src="game.header_img"
                    :alt="game.name"
                    class="border-border/40 h-6.5 w-12 shrink-0 rounded-md border object-cover"
                    @error="handleImageError"
                  />

                  <div class="min-w-0">
                    <h4 class="text-foreground truncate text-xs font-bold" :title="game.name">
                      {{ game.name }}
                    </h4>
                    <p
                      v-if="game.playtime_2weeks"
                      class="text-muted-foreground/90 mt-0.5 text-[10px] font-semibold"
                    >
                      {{ Math.round((game.playtime_2weeks / 60) * 10) / 10 }}
                      {{ $t("common.hoursSuffix") }}
                    </p>
                  </div>
                </div>

                <!-- Category toggle switch/button -->
                <UiButton
                  variant="outline"
                  size="icon"
                  class="h-8 w-8 shrink-0 rounded-xl transition-transform active:scale-95"
                  :class="
                    getGameCategory(game) === 'story'
                      ? 'border-cyan-500/20 bg-cyan-500/5 text-cyan-400 hover:text-cyan-300'
                      : 'border-rose-500/20 bg-rose-500/5 text-rose-500 hover:text-rose-400'
                  "
                  :title="
                    getGameCategory(game) === 'story'
                      ? $t('detox.storyBtn')
                      : $t('detox.sessionBtn')
                  "
                  @click="toggleGameCategory(game.appid, games)"
                >
                  <span class="text-base select-none">
                    <span v-if="getGameCategory(game) === 'story'">🎭</span>
                    <span v-else>🎮</span>
                  </span>
                </UiButton>
              </div>
            </div>
          </div>
        </transition>
      </UiCardContent>
    </UiCard>

    <!-- Refactored Roulette Modal Component -->
    <GamesLibraryDetoxRoulette v-model:open="showRouletteModal" :games="games" />
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { ShieldIcon, SettingsIcon } from "@lucide/vue";
import { type SteamGame } from "~/types";

const props = defineProps<{
  games: SteamGame[];
}>();

const { getGameCategory, toggleGameCategory } = useGameCategories();

// Use the new composable for statistics calculations
const {
  recentlyPlayedGames,
  recentStoryHours,
  recentSessionHours,
  recentTotalHours,
  storyPercentage,
  hygieneStatus,
} = useLibraryDetox(() => props.games);

const showCategorizer = ref(false);
const showRouletteModal = ref(false);

const hygieneBadgeClass = computed(() => {
  switch (hygieneStatus.value) {
    case "excellent":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    case "balanced":
      return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20";
    case "poor":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20";
    case "critical":
      return "bg-rose-500/10 text-rose-600 dark:text-rose-500 border-rose-500/20 shadow-xs";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
});

const adviceBoxClass = computed(() => {
  switch (hygieneStatus.value) {
    case "excellent":
      return "bg-emerald-500/5 border-emerald-500/10 text-emerald-800 dark:text-emerald-300";
    case "balanced":
      return "bg-cyan-500/5 border-cyan-500/10 text-cyan-800 dark:text-cyan-300";
    case "poor":
      return "bg-amber-500/5 border-amber-500/10 text-amber-800 dark:text-amber-300";
    case "critical":
      return "bg-rose-500/5 border-rose-500/10 text-rose-800 dark:text-rose-400 shadow-xs";
    default:
      return "bg-muted/10 border-border text-muted-foreground";
  }
});

const detoxCardClass = computed(() => {
  switch (hygieneStatus.value) {
    case "excellent":
      return "detox-card-excellent border-emerald-500/20";
    case "balanced":
      return "detox-card-balanced border-cyan-500/20";
    case "poor":
      return "detox-card-poor border-amber-500/20";
    case "critical":
      return "detox-card-critical border-rose-500/30";
    default:
      return "border-border/80 shadow-md";
  }
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
.animate-fade-in {
  animation: fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Custom Progress Bar Indicator colors targeting scoped slots */
.progress-excellent :deep([data-slot="progress-indicator"]) {
  background-color: var(--emerald-500, #10b981) !important;
}
.progress-balanced :deep([data-slot="progress-indicator"]) {
  background-color: var(--cyan-400, #22d3ee) !important;
}
.progress-poor :deep([data-slot="progress-indicator"]) {
  background-color: var(--amber-500, #f59e0b) !important;
}
.progress-critical :deep([data-slot="progress-indicator"]) {
  background-color: var(--rose-500, #f43f5e) !important;
}
.progress-inactive :deep([data-slot="progress-indicator"]) {
  background-color: var(--muted-foreground, #737373) !important;
}

/* Slide-fade transition for categorizer */
.slide-fade-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-12px);
  opacity: 0;
}

/* Detox Card Pulsing Glow Keyframes & Classes */
.detox-card-excellent {
  box-shadow: 0 0 15px 1px rgba(16, 185, 129, 0.08);
  animation: pulse-excellent 4s infinite ease-in-out;
}
.detox-card-balanced {
  box-shadow: 0 0 15px 1px rgba(6, 182, 212, 0.08);
  animation: pulse-balanced 4s infinite ease-in-out;
}
.detox-card-poor {
  box-shadow: 0 0 15px 1px rgba(245, 158, 11, 0.1);
  animation: pulse-poor 4s infinite ease-in-out;
}
.detox-card-critical {
  box-shadow: 0 0 18px 2px rgba(244, 63, 94, 0.15);
  animation: pulse-critical 3s infinite ease-in-out;
}

@keyframes pulse-excellent {
  0%,
  100% {
    box-shadow: 0 0 15px 1px rgba(16, 185, 129, 0.08);
    border-color: rgba(16, 185, 129, 0.2);
  }
  50% {
    box-shadow: 0 0 25px 3px rgba(16, 185, 129, 0.15);
    border-color: rgba(16, 185, 129, 0.45);
  }
}
@keyframes pulse-balanced {
  0%,
  100% {
    box-shadow: 0 0 15px 1px rgba(6, 182, 212, 0.08);
    border-color: rgba(6, 182, 212, 0.2);
  }
  50% {
    box-shadow: 0 0 25px 3px rgba(6, 182, 212, 0.15);
    border-color: rgba(6, 182, 212, 0.45);
  }
}
@keyframes pulse-poor {
  0%,
  100% {
    box-shadow: 0 0 15px 1px rgba(245, 158, 11, 0.1);
    border-color: rgba(245, 158, 11, 0.2);
  }
  50% {
    box-shadow: 0 0 25px 4px rgba(245, 158, 11, 0.18);
    border-color: rgba(245, 158, 11, 0.45);
  }
}
@keyframes pulse-critical {
  0%,
  100% {
    box-shadow: 0 0 18px 2px rgba(244, 63, 94, 0.12);
    border-color: rgba(244, 63, 94, 0.25);
  }
  50% {
    box-shadow: 0 0 28px 5px rgba(244, 63, 94, 0.24);
    border-color: rgba(244, 63, 94, 0.6);
  }
}
</style>
