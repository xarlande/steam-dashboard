<template>
  <transition name="fade">
    <div
      v-if="open"
      class="bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md transition-opacity duration-300"
    >
      <div
        class="bg-card border-border/80 animate-fade-in relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border shadow-2xl"
      >
        <!-- Modal Header -->
        <div class="border-border/60 flex items-center justify-between border-b p-5">
          <div class="flex items-center gap-3">
            <FileTextIcon class="h-5.5 w-5.5 text-cyan-400" />
            <div>
              <h3 class="text-foreground text-base font-bold">
                {{ $t("exportReport.title") }}
              </h3>
              <p class="text-muted-foreground mt-0.5 text-xs leading-normal">
                {{ $t("exportReport.desc") }}
              </p>
            </div>
          </div>
          <UiButton
            variant="ghost"
            size="icon"
            @click="open = false"
            class="hover:bg-accent h-8 w-8 rounded-full"
          >
            <XIcon class="h-4 w-4" />
          </UiButton>
        </div>

        <!-- Modal Body (Content) -->
        <div class="flex-1 space-y-5 overflow-y-auto p-5">
          <!-- Loading Progress Section -->
          <div
            v-if="isCopying"
            class="flex flex-col items-center justify-center space-y-4 py-8 text-center"
          >
            <div class="relative flex items-center justify-center">
              <Loader2Icon class="h-10 w-10 animate-spin text-cyan-400" />
            </div>
            <div class="space-y-1">
              <p class="text-foreground text-sm font-bold">
                {{ $t("exportReport.fetchProgress", { current: copyProgress, total: copyTotal }) }}
              </p>
              <p class="text-muted-foreground max-w-md truncate text-xs italic">
                {{ $t("exportReport.fetching", { game: copyCurrentGameName }) }}
              </p>
            </div>

            <!-- Progress Bar -->
            <div class="bg-muted h-2.5 w-full max-w-md overflow-hidden rounded-full">
              <div
                class="h-full bg-cyan-500 transition-all duration-300 ease-out"
                :style="{ width: `${(copyProgress / copyTotal) * 100}%` }"
              ></div>
            </div>

            <UiButton variant="outline" size="sm" @click="cancelExportReport">
              {{ $t("exportReport.cancel") }}
            </UiButton>
          </div>

          <!-- Report Preview Section -->
          <div v-else class="space-y-5">
            <!-- Empty state: Click to generate -->
            <div
              v-if="!copyReportText"
              class="flex flex-col items-center justify-center space-y-4 py-12 text-center"
            >
              <div class="rounded-full bg-cyan-500/10 p-3 text-cyan-400">
                <FileTextIcon class="h-8 w-8" />
              </div>

              <!-- Option checkbox before generating -->
              <div
                class="border-border/50 mb-2 flex items-center gap-2 rounded-xl border bg-neutral-900/40 px-4 py-2.5"
              >
                <input
                  type="checkbox"
                  id="include-achievements-empty"
                  v-model="includeAchievements"
                  class="h-4 w-4 cursor-pointer rounded border-neutral-700 bg-neutral-950 text-cyan-500 focus:ring-cyan-500/50"
                />
                <label
                  for="include-achievements-empty"
                  class="text-muted-foreground cursor-pointer text-xs font-semibold select-none"
                >
                  {{ $t("exportReport.optIncludeAchievements") }}
                </label>
              </div>

              <UiButton @click="startExportReport">
                {{ $t("exportReport.generateBtn") }}
              </UiButton>
            </div>

            <!-- Report Text Area -->
            <div v-else class="space-y-3">
              <!-- Option checkbox active -->
              <div
                class="border-border/50 flex items-center gap-2 rounded-xl border bg-neutral-900/40 px-4 py-2.5"
              >
                <input
                  type="checkbox"
                  id="include-achievements-active"
                  v-model="includeAchievements"
                  class="h-4 w-4 cursor-pointer rounded border-neutral-700 bg-neutral-950 text-cyan-500 focus:ring-cyan-500/50"
                />
                <label
                  for="include-achievements-active"
                  class="text-muted-foreground cursor-pointer text-xs font-semibold select-none"
                >
                  {{ $t("exportReport.optIncludeAchievements") }}
                </label>
              </div>

              <textarea
                readonly
                class="border-border/80 h-80 w-full rounded-xl border bg-neutral-900 p-3.5 font-mono text-xs text-neutral-100 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                :value="copyReportText"
                placeholder="Report will appear here..."
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="border-border/60 bg-muted/20 flex items-center justify-between border-t p-4">
          <span class="text-muted-foreground text-xs">
            {{ copyReportText ? $t("exportReport.totalGames", { count: totalCount }) : "" }}
          </span>
          <div class="flex items-center gap-3">
            <UiButton
              v-if="copyReportText && !isCopying"
              variant="outline"
              @click="startExportReport"
              size="sm"
              class="text-xs"
            >
              🔄 {{ $t("roulette.again") }}
            </UiButton>
            <UiButton
              v-if="copyReportText && !isCopying"
              @click="copyTextToClipboard(copyReportText)"
              size="sm"
              class="flex items-center gap-1.5 text-xs"
            >
              <CopyIcon class="h-4 w-4" />
              <span>{{ $t("exportReport.copyBtn") }}</span>
            </UiButton>
            <UiButton variant="secondary" @click="open = false" size="sm" class="text-xs">
              {{ $t("common.close") }}
            </UiButton>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { Loader2Icon, FileTextIcon, CopyIcon, XIcon } from "@lucide/vue";
import { toast } from "vue-sonner";
import type { SteamGame, GamesReportAchievementsTypes } from "~/types";

const props = defineProps<{
  games: SteamGame[];
}>();

const open = defineModel<boolean>("open", { default: false });

const { locale, t } = useI18n();

// Computed states
const totalCount = computed(() => props.games.length);
const totalHours = computed(() => {
  return props.games.reduce((sum, g) => sum + (g.playtime_hours || 0), 0);
});

// Export achievements report states
const isCopying = ref(false);
const copyProgress = ref(0);
const copyTotal = ref(0);
const copyCurrentGameName = ref("");
const copyReportText = ref("");
const includeAchievements = ref(true);

watch(includeAchievements, () => {
  if (copyReportText.value) {
    regenerateReport();
  }
});

// Cache for achievements to prevent redundant network requests
const achievementsCache = ref<Record<number, GamesReportAchievementsTypes.AchievementsCacheEntry>>(
  {},
);

function cancelExportReport() {
  isCopying.value = false;
}

// Helper to fetch achievements for a single game and update achievementsCache
async function fetchGameAchievements(game: SteamGame, langVal: string) {
  if (achievementsCache.value[game.appid]) return;

  try {
    copyCurrentGameName.value = game.name;
    const response = await apiRepository.loadAchievements({
      appid: String(game.appid),
      lang: langVal,
    });

    if (response.success) {
      achievementsCache.value[game.appid] = {
        hasAchievements: response.total_count !== undefined && response.total_count > 0,
        achievements: response.achievements || [],
        totalCount: response.total_count || 0,
        unlockedCount: response.unlocked_count || 0,
        unlockedPercent: response.unlocked_percent || 0,
      };
      return;
    }
  } catch (err) {
    console.error(`Failed to fetch achievements for ${game.name}:`, err);
  }

  // Default empty data on failure
  achievementsCache.value[game.appid] = {
    hasAchievements: false,
    achievements: [],
    totalCount: 0,
    unlockedCount: 0,
    unlockedPercent: 0,
  };
}

async function startExportReport() {
  if (props.games.length === 0) return;

  isCopying.value = true;
  copyProgress.value = 0;
  copyTotal.value = props.games.length;
  copyReportText.value = "";

  const langVal = locale.value;

  const chunkSize = 5; // Fetch in chunks of 5 parallel requests to be friendly to Steam API

  for (let i = 0; i < props.games.length; i += chunkSize) {
    if (!isCopying.value) break;

    const chunk = props.games.slice(i, i + chunkSize);
    // eslint-disable-next-line no-await-in-loop
    await Promise.all(chunk.map((game) => fetchGameAchievements(game, langVal)));

    copyProgress.value = Math.min(i + chunkSize, props.games.length);
  }

  if (isCopying.value) {
    isCopying.value = false;
    regenerateReport();
  }
}

function regenerateReport() {
  const results: GamesReportAchievementsTypes.GameReportAchievements[] = props.games.map((game) => {
    const cache = achievementsCache.value[game.appid];
    return {
      game,
      hasAchievements: cache ? cache.hasAchievements : false,
      achievements: cache ? cache.achievements : [],
      totalCount: cache ? cache.totalCount : 0,
      unlockedCount: cache ? cache.unlockedCount : 0,
      unlockedPercent: cache ? cache.unlockedPercent : 0,
    };
  });

  const text = reportGameAchievementFormatReport({
    results,
    totalCount: totalCount.value,
    totalHours: totalHours.value,
    t,
    includeAchievements: includeAchievements.value,
  });

  copyReportText.value = text;
  copyTextToClipboard(text);
}

function copyTextToClipboard(text: string) {
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success(t("exportReport.copied"));
      })
      .catch((err) => {
        console.error("Failed to copy report to clipboard:", err);
      });
  }
}
</script>

<style scoped>
/* Fade transition for modals */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

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
</style>
