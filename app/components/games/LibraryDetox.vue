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
                    @click="startRoulette"
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
                class="border-border bg-card/30 hover:bg-card/50 flex items-center justify-between rounded-2xl border p-3 transition-all"
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
  </section>

  <!-- Roulette Modal -->
  <div
    v-if="showRouletteModal"
    class="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md transition-all duration-300"
  >
    <div
      class="bg-card border-border/80 relative flex w-full max-w-md flex-col items-center overflow-hidden rounded-3xl border p-6 text-center shadow-2xl"
    >
      <!-- Decorative background glow -->
      <div
        class="pointer-events-none absolute -top-12 -left-12 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl"
      ></div>
      <div
        class="pointer-events-none absolute -right-12 -bottom-12 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl"
      ></div>

      <!-- Close button -->
      <button
        @click="showRouletteModal = false"
        class="text-muted-foreground hover:text-foreground absolute top-4 right-4 cursor-pointer rounded-full p-2 transition-colors hover:bg-neutral-800"
        title="Close"
      >
        <XIcon class="h-5 w-5" />
      </button>

      <!-- Modal Title -->
      <h3
        class="mb-6 flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-xl font-extrabold tracking-tight text-transparent"
      >
        <span>🎡</span> {{ $t("roulette.title") }}
      </h3>

      <!-- The Roulette Reel -->
      <div
        class="relative mb-6 flex h-32 w-full items-center justify-center overflow-hidden rounded-2xl border border-cyan-500/30 bg-neutral-950/70 shadow-[inset_0_0_24px_rgba(6,182,212,0.15)]"
      >
        <div class="absolute top-0 right-0 left-0" :style="reelStyle">
          <div
            v-for="(game, index) in reelGames"
            :key="index"
            class="flex h-32 flex-col items-center justify-center px-4"
          >
            <img
              :src="game.header_img"
              :alt="game.name"
              class="border-border h-15 w-32 rounded-lg border object-cover shadow-md"
              @error="handleImageError"
            />
            <span
              class="text-foreground mt-2 max-w-[260px] truncate text-sm font-black tracking-tight"
              >{{ game.name }}</span
            >
          </div>
        </div>

        <!-- Viewport Overlay line markers -->
        <div
          class="pointer-events-none absolute inset-x-0 inset-y-10 border-y border-cyan-500/20 bg-cyan-500/5"
        ></div>

        <!-- Side shadow overlays to make it look 3D cylindrical -->
        <div
          class="pointer-events-none absolute inset-0 bg-gradient-to-b from-neutral-950/60 via-transparent to-neutral-950/60"
        ></div>
      </div>

      <!-- Spinner Status / Results -->
      <div class="w-full space-y-5">
        <div v-if="isSpinning" class="space-y-3">
          <p
            class="text-muted-foreground animate-pulse text-xs font-semibold tracking-widest uppercase"
          >
            {{ $t("roulette.spinning") }}
          </p>
          <div class="flex justify-center gap-1.5">
            <span class="h-2.5 w-2.5 animate-bounce rounded-full bg-cyan-400"></span>
            <span
              class="h-2.5 w-2.5 animate-bounce rounded-full bg-cyan-400 [animation-delay:0.2s]"
            ></span>
            <span
              class="h-2.5 w-2.5 animate-bounce rounded-full bg-cyan-400 [animation-delay:0.4s]"
            ></span>
          </div>
        </div>

        <div v-else-if="finalSelectedGame" class="animate-fade-in space-y-5">
          <div class="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4.5 text-sm">
            <span class="mb-2 block text-2xl select-none">✨</span>
            <p class="mb-2 leading-snug font-bold text-cyan-400">{{ $t("roulette.landing") }}</p>
            <h4 class="text-foreground text-lg font-black tracking-tight">
              {{ finalSelectedGame.name }}
            </h4>
            <p class="text-muted-foreground mt-1 text-xs font-semibold">
              {{
                $t("roulette.playtime", { hours: formatHours(finalSelectedGame.playtime_hours) })
              }}
            </p>
          </div>

          <!-- Action buttons -->
          <div class="flex w-full flex-col gap-2.5">
            <UiButton as-child class="w-full py-5 font-bold shadow-lg shadow-cyan-900/10">
              <a :href="'steam://run/' + finalSelectedGame.appid">
                <PlayIcon class="mr-2 h-4.5 w-4.5 fill-current" />
                <span>{{ $t("roulette.launch") }}</span>
              </a>
            </UiButton>

            <div class="grid w-full grid-cols-2 gap-2.5">
              <UiButton as-child variant="outline" size="sm" class="font-semibold">
                <NuxtLinkLocale :to="'/game/' + finalSelectedGame.appid">
                  🏆 {{ $t("roulette.achievements") }}
                </NuxtLinkLocale>
              </UiButton>

              <UiButton variant="outline" size="sm" class="font-semibold" @click="startRoulette">
                🔄 {{ $t("roulette.again") }}
              </UiButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { ShieldIcon, SettingsIcon, XIcon, PlayIcon } from "@lucide/vue";
import { GameTypes, type SteamGame } from "~/types";

const props = defineProps<{
  games: SteamGame[];
}>();

const { getGameCategory, toggleGameCategory } = useGameCategories();

// State variables for Gaming Time Quality Feature
const showCategorizer = ref(false);

const recentlyPlayedGames = computed(() =>
  props.games.filter((g) => g.playtime_2weeks && g.playtime_2weeks > 0),
);

const recentStoryMinutes = computed(() =>
  recentlyPlayedGames.value.reduce(
    (sum, g) =>
      getGameCategory(g) === GameTypes.Category.Story ? sum + (g.playtime_2weeks || 0) : sum,
    0,
  ),
);

const recentSessionMinutes = computed(() =>
  recentlyPlayedGames.value.reduce(
    (sum, g) =>
      getGameCategory(g) === GameTypes.Category.Session ? sum + (g.playtime_2weeks || 0) : sum,
    0,
  ),
);

const recentTotalMinutes = computed(() => recentStoryMinutes.value + recentSessionMinutes.value);

const recentStoryHours = computed(() => Math.round((recentStoryMinutes.value / 60) * 10) / 10);
const recentSessionHours = computed(() => Math.round((recentSessionMinutes.value / 60) * 10) / 10);
const recentTotalHours = computed(() => Math.round((recentTotalMinutes.value / 60) * 10) / 10);

const storyPercentage = computed(() => {
  if (recentTotalMinutes.value === 0) {
    return 0;
  }
  return Math.round((recentStoryMinutes.value / recentTotalMinutes.value) * 100);
});

const hygieneStatus = computed(() => {
  if (recentTotalHours.value < 0.5) {
    return "inactive";
  }

  if (storyPercentage.value < 20 && recentSessionHours.value >= 20) {
    return "critical";
  }
  if (storyPercentage.value < 35) {
    return "poor";
  }
  if (storyPercentage.value >= 35 && storyPercentage.value < 70) {
    return "balanced";
  }
  return "excellent";
});

const hygieneBadgeClass = computed(() => {
  switch (hygieneStatus.value) {
    case "excellent": {
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    }
    case "balanced": {
      return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20";
    }
    case "poor": {
      return "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20";
    }
    case "critical": {
      return "bg-rose-500/10 text-rose-600 dark:text-rose-500 border-rose-500/20 shadow-xs";
    }
    default: {
      return "bg-muted text-muted-foreground border-border";
    }
  }
});

const adviceBoxClass = computed(() => {
  switch (hygieneStatus.value) {
    case "excellent": {
      return "bg-emerald-500/5 border-emerald-500/10 text-emerald-800 dark:text-emerald-300";
    }
    case "balanced": {
      return "bg-cyan-500/5 border-cyan-500/10 text-cyan-800 dark:text-cyan-300";
    }
    case "poor": {
      return "bg-amber-500/5 border-amber-500/10 text-amber-800 dark:text-amber-300";
    }
    case "critical": {
      return "bg-rose-500/5 border-rose-500/10 text-rose-800 dark:text-rose-400 shadow-xs";
    }
    default: {
      return "bg-muted/10 border-border text-muted-foreground";
    }
  }
});

const detoxCardClass = computed(() => {
  switch (hygieneStatus.value) {
    case "excellent": {
      return "detox-card-excellent border-emerald-500/20";
    }
    case "balanced": {
      return "detox-card-balanced border-cyan-500/20";
    }
    case "poor": {
      return "detox-card-poor border-amber-500/20";
    }
    case "critical": {
      return "detox-card-critical border-rose-500/30";
    }
    default: {
      return "border-border/80 shadow-md";
    }
  }
});

// Roulette state variables
const showRouletteModal = ref(false);
const isSpinning = ref(false);
const candidateGames = ref<SteamGame[]>([]);
const reelGames = ref<SteamGame[]>([]);
const reelTranslateY = ref(0);
const transitionEnabled = ref(false);
const finalSelectedGame = ref<SteamGame | null>(null);

const reelStyle = computed(() => ({
  transform: `translateY(${reelTranslateY.value}px)`,
  transition: transitionEnabled.value ? "transform 3.0s cubic-bezier(0.1, 0.85, 0.25, 1)" : "none",
}));

function selectRouletteCandidates() {
  // Filter story games that have playtime between 1h (60m) and 100h (6000m)
  let candidates = props.games.filter((g) => {
    const category = getGameCategory(g);
    return (
      category === GameTypes.Category.Story &&
      g.playtime_forever >= 60 &&
      g.playtime_forever <= 6000
    );
  });

  // Fallback 1: Allow any story game with playtime >= 5 mins (started but not finished)
  if (candidates.length < 3) {
    candidates = props.games.filter((g) => {
      const category = getGameCategory(g);
      return category === GameTypes.Category.Story && g.playtime_forever >= 5;
    });
  }

  // Fallback 2: Allow any story game in the library
  if (candidates.length < 3) {
    candidates = props.games.filter((g) => getGameCategory(g) === GameTypes.Category.Story);
  }

  // Fallback 3: Allow any game at all
  if (candidates.length < 3) {
    candidates = [...props.games];
  }

  // Shuffle and grab up to 12 candidates
  const shuffled = [...candidates].sort(() => 0.5 - Math.random());
  candidateGames.value = shuffled.slice(0, Math.min(shuffled.length, 12));
}

function startRoulette() {
  if (isSpinning.value) {
    return;
  }

  selectRouletteCandidates();
  if (candidateGames.value.length === 0) {
    return;
  }

  // Build the reel tape
  const pool = candidateGames.value;
  const repeats = 6;
  const list: SteamGame[] = [];
  for (let i = 0; i < repeats; i++) {
    list.push(...pool);
  }
  reelGames.value = list;

  // Reset offset and transition
  transitionEnabled.value = false;
  reelTranslateY.value = 0;
  finalSelectedGame.value = null;
  isSpinning.value = true;
  showRouletteModal.value = true;

  // Let browser layout adjust and run the transition scroll
  setTimeout(() => {
    transitionEnabled.value = true;
    const randomIndex = Math.floor(Math.random() * pool.length);
    // Land on the second-to-last repeat block
    const targetIndex = (repeats - 2) * pool.length + randomIndex;

    // Height of each reel item is 128px (h-32 = 8rem = 128px)
    reelTranslateY.value = -(targetIndex * 128);

    setTimeout(() => {
      isSpinning.value = false;
      finalSelectedGame.value = pool[randomIndex] ?? null;
    }, 3100);
  }, 50);
}

// Format numbers nicely (e.g. 1,234.5)
function formatHours(hours: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(hours);
}

// Fallback image handler in case Steam banner is missing
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
