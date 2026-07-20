<template>
  <UiDialog v-model:open="isOpen">
    <UiDialogContent
      class="flex flex-col items-center gap-0 overflow-hidden p-6 text-center sm:max-w-md"
    >
      <!-- Decorative background glow -->
      <div
        class="pointer-events-none absolute -top-12 -left-12 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl"
      ></div>
      <div
        class="pointer-events-none absolute -right-12 -bottom-12 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl"
      ></div>

      <!-- Modal Title -->
      <h3
        class="mb-6 flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-violet-600 bg-clip-text text-xl font-extrabold tracking-tight text-transparent dark:from-cyan-400 dark:to-violet-400"
      >
        <span>🎡</span> {{ $t("roulette.title") }}
      </h3>

      <!-- The Roulette Reel -->
      <div
        class="relative mb-6 flex h-32 w-full items-center justify-center overflow-hidden rounded-2xl border border-cyan-500/30 bg-neutral-100/90 shadow-[inset_0_0_24px_rgba(6,182,212,0.1)] dark:bg-neutral-950/70 dark:shadow-[inset_0_0_24px_rgba(6,182,212,0.15)]"
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
          class="pointer-events-none absolute inset-0 bg-gradient-to-b from-popover/80 via-transparent to-popover/80 dark:from-neutral-950/60 dark:to-neutral-950/60"
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
            <p class="mb-2 leading-snug font-bold text-cyan-600 dark:text-cyan-400">{{ $t("roulette.landing") }}</p>
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
    </UiDialogContent>
  </UiDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { XIcon, PlayIcon } from "@lucide/vue";
import { GameTypes, type SteamGame } from "~/types";

const props = defineProps<{
  games: SteamGame[];
}>();

const isOpen = defineModel<boolean>("open", { default: false });

const { getGameCategory } = useGameCategories();

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

// Watch for opening the modal to auto-spin
watch(isOpen, (newVal) => {
  if (newVal) {
    startRoulette();
  }
});

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
</style>
