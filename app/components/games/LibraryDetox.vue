<template>
  <section v-if="games.length > 0" class="mb-8 animate-fade-in">
    <UiCard
      :class="detoxCardClass"
      class="overflow-hidden bg-card/45 backdrop-blur-md transition-all duration-500 border border-border/50"
    >
      <UiCardContent class="p-6">
        <!-- Header Row -->
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/60"
        >
          <div class="flex items-center gap-3">
            <div
              class="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0"
            >
              <ShieldIcon class="w-6 h-6" />
            </div>
            <div>
              <h2 class="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                {{ $t("detox.title") }}
              </h2>
              <p class="text-xs text-muted-foreground font-medium mt-0.5">
                {{ $t("detox.description") }}
              </p>
            </div>
          </div>

          <!-- Status Badge -->
          <div class="self-start sm:self-auto flex items-center gap-2">
            <span class="text-xs text-muted-foreground font-semibold uppercase tracking-wider"
              >{{ $t("detox.statusLabel") }}:</span
            >
            <UiBadge
              :class="hygieneBadgeClass"
              class="text-xs py-1 px-3 font-bold border rounded-lg transition-all duration-300"
            >
              {{ $t("detox.states." + hygieneStatus + ".title") }}
            </UiBadge>
          </div>
        </div>

        <!-- Content Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <!-- Left Column: Advice Box and Progress Scale -->
          <div class="md:col-span-2 flex flex-col justify-between gap-6">
            <!-- Recommendations/Hygienic advice -->
            <div
              class="p-4 sm:p-5 rounded-2xl border flex items-start gap-4 transition-all duration-300"
              :class="adviceBoxClass"
            >
              <span class="text-3xl shrink-0 select-none">
                <span v-if="hygieneStatus === 'critical'">🚨</span>
                <span v-else-if="hygieneStatus === 'poor'">⚠️</span>
                <span v-else-if="hygieneStatus === 'balanced'">⚖️</span>
                <span v-else-if="hygieneStatus === 'excellent'">✨</span>
                <span v-else>🌱</span>
              </span>
              <div>
                <h4
                  class="font-extrabold text-sm tracking-tight mb-1 uppercase tracking-wide opacity-90"
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
                    class="bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-900/10 transition-all duration-300 active:scale-95 border-0 flex items-center gap-1.5"
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
                class="flex items-center justify-between text-xs font-semibold text-muted-foreground"
              >
                <span class="flex items-center gap-1.5"
                  ><span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span> 🎮
                  {{ $t("detox.sessionLabel") }}</span
                >
                <span class="text-foreground text-sm font-black"
                  >{{ storyPercentage }}% {{ $t("detox.storyRatio") }}</span
                >
                <span class="flex items-center gap-1.5"
                  ><span class="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> 🎭
                  {{ $t("detox.storyLabel") }}</span
                >
              </div>

              <UiProgress
                :model-value="storyPercentage"
                class="h-3.5 bg-neutral-200 dark:bg-neutral-800/80 rounded-full overflow-hidden"
                :class="'progress-' + hygieneStatus"
              />

              <div
                class="flex items-center justify-between text-[10px] text-muted-foreground/80 font-bold uppercase tracking-wider"
              >
                <span>100% {{ $t("detox.sessionLabel") }}</span>
                <span>50/50 Balance</span>
                <span>100% {{ $t("detox.storyLabel") }}</span>
              </div>
            </div>
          </div>

          <!-- Right Column: Recent Playtime Summary & Toggle -->
          <div
            class="p-5 rounded-2xl bg-card/30 border border-border/80 flex flex-col justify-between gap-6"
          >
            <div class="space-y-4">
              <h3 class="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                {{ $t("detox.recentPlaytime") }}
              </h3>

              <div class="space-y-3">
                <!-- Total Recent Time -->
                <div class="flex justify-between items-baseline pb-2.5 border-b border-border/60">
                  <span class="text-sm text-muted-foreground font-semibold">Total</span>
                  <span class="text-2xl font-black text-foreground"
                    >{{ formatHours(recentTotalHours) }}
                    <span class="text-xs font-semibold text-muted-foreground">{{
                      $t("common.hoursSuffix")
                    }}</span></span
                  >
                </div>

                <!-- Story Hours -->
                <div class="flex justify-between items-center">
                  <span class="text-xs font-semibold text-muted-foreground">{{
                    $t("detox.storyLabel")
                  }}</span>
                  <span class="text-sm font-bold text-cyan-400"
                    >{{ formatHours(recentStoryHours) }} {{ $t("common.hoursSuffix") }}</span
                  >
                </div>

                <!-- Session Hours -->
                <div class="flex justify-between items-center">
                  <span class="text-xs font-semibold text-muted-foreground">{{
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
              class="w-full text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              @click="showCategorizer = !showCategorizer"
            >
              <SettingsIcon class="w-4 h-4 mr-2" />
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
            class="mt-6 pt-6 border-t border-border/60"
          >
            <div class="mb-4">
              <h3 class="text-sm font-bold text-foreground">{{ $t("detox.customizeHeader") }}</h3>
              <p class="text-xs text-muted-foreground font-medium mt-0.5">
                {{ $t("detox.customizeDesc") }}
              </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div
                v-for="game in recentlyPlayedGames"
                :key="'cat-' + game.appid"
                class="flex items-center justify-between p-3 rounded-2xl border border-border bg-card/30 hover:bg-card/50 transition-all"
              >
                <div class="flex items-center gap-3 min-w-0 flex-1 pr-2">
                  <!-- Small game banner -->
                  <img
                    :src="game.header_img"
                    :alt="game.name"
                    class="w-12 h-6.5 rounded-md object-cover border border-border/40 shrink-0"
                    @error="handleImageError"
                  />

                  <div class="min-w-0">
                    <h4 class="text-xs font-bold text-foreground truncate" :title="game.name">
                      {{ game.name }}
                    </h4>
                    <p
                      v-if="game.playtime_2weeks"
                      class="text-[10px] text-muted-foreground/90 font-semibold mt-0.5"
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
                  class="h-8 w-8 rounded-xl shrink-0 transition-transform active:scale-95"
                  :class="
                    getGameCategory(game) === 'story'
                      ? 'text-cyan-400 bg-cyan-500/5 border-cyan-500/20 hover:text-cyan-300'
                      : 'text-rose-500 bg-rose-500/5 border-rose-500/20 hover:text-rose-400'
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
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all duration-300 animate-fade-in"
  >
    <div
      class="relative w-full max-w-md bg-card border border-border/80 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center overflow-hidden"
    >
      <!-- Decorative background glow -->
      <div
        class="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"
      ></div>
      <div
        class="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-violet-500/10 blur-3xl pointer-events-none"
      ></div>

      <!-- Close button -->
      <button
        @click="showRouletteModal = false"
        class="absolute top-4 right-4 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-neutral-800 transition-colors cursor-pointer"
        title="Close"
      >
        <XIcon class="w-5 h-5" />
      </button>

      <!-- Modal Title -->
      <h3
        class="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400 mb-6 flex items-center gap-2"
      >
        <span>🎡</span> {{ $t("roulette.title") }}
      </h3>

      <!-- The Roulette Reel -->
      <div
        class="relative h-32 w-full overflow-hidden border border-cyan-500/30 rounded-2xl bg-neutral-950/70 shadow-[inset_0_0_24px_rgba(6,182,212,0.15)] mb-6 flex items-center justify-center"
      >
        <div class="absolute left-0 right-0 top-0" :style="reelStyle">
          <div
            v-for="(game, index) in reelGames"
            :key="index"
            class="h-32 flex flex-col items-center justify-center px-4"
          >
            <img
              :src="game.header_img"
              :alt="game.name"
              class="w-32 h-15 rounded-lg object-cover border border-border shadow-md"
              @error="handleImageError"
            />
            <span
              class="text-sm font-black text-foreground truncate max-w-[260px] mt-2 tracking-tight"
              >{{ game.name }}</span
            >
          </div>
        </div>

        <!-- Viewport Overlay line markers -->
        <div
          class="absolute inset-x-0 inset-y-10 border-y border-cyan-500/20 bg-cyan-500/5 pointer-events-none"
        ></div>

        <!-- Side shadow overlays to make it look 3D cylindrical -->
        <div
          class="absolute inset-0 bg-gradient-to-b from-neutral-950/60 via-transparent to-neutral-950/60 pointer-events-none"
        ></div>
      </div>

      <!-- Spinner Status / Results -->
      <div class="w-full space-y-5">
        <div v-if="isSpinning" class="space-y-3">
          <p
            class="text-xs font-semibold text-muted-foreground uppercase tracking-widest animate-pulse"
          >
            {{ $t("roulette.spinning") }}
          </p>
          <div class="flex justify-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce"></span>
            <span
              class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]"
            ></span>
            <span
              class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]"
            ></span>
          </div>
        </div>

        <div v-else-if="finalSelectedGame" class="animate-fade-in space-y-5">
          <div class="p-4.5 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 text-sm">
            <span class="text-2xl mb-2 block select-none">✨</span>
            <p class="font-bold text-cyan-400 mb-2 leading-snug">{{ $t("roulette.landing") }}</p>
            <h4 class="text-lg font-black text-foreground tracking-tight">
               {{ finalSelectedGame.name }}
            </h4>
            <p class="text-xs text-muted-foreground font-semibold mt-1">
              {{
                $t("roulette.playtime", { hours: formatHours(finalSelectedGame.playtime_hours) })
              }}
            </p>
          </div>

          <!-- Action buttons -->
          <div class="flex flex-col gap-2.5 w-full">
            <UiButton as-child class="w-full py-5 font-bold shadow-lg shadow-cyan-900/10">
              <a :href="'steam://run/' + finalSelectedGame.appid">
                <PlayIcon class="w-4.5 h-4.5 fill-current mr-2" />
                <span>{{ $t("roulette.launch") }}</span>
              </a>
            </UiButton>

            <div class="grid grid-cols-2 gap-2.5 w-full">
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
