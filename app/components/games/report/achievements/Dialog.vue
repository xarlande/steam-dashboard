<template>
  <transition name="fade">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md transition-opacity duration-300"
    >
      <div
        class="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-card border border-border/80 shadow-2xl overflow-hidden animate-fade-in"
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-5 border-b border-border/60">
          <div class="flex items-center gap-3">
            <FileTextIcon class="w-5.5 h-5.5 text-cyan-400" />
            <div>
              <h3 class="text-base font-bold text-foreground">
                {{ $t("exportReport.title") }}
              </h3>
              <p class="text-xs text-muted-foreground mt-0.5 leading-normal">
                {{ $t("exportReport.desc") }}
              </p>
            </div>
          </div>
          <UiButton
            variant="ghost"
            size="icon"
            @click="open = false"
            class="rounded-full w-8 h-8 hover:bg-accent"
          >
            <XIcon class="w-4 h-4" />
          </UiButton>
        </div>

        <!-- Modal Body (Content) -->
        <div class="flex-1 overflow-y-auto p-5 space-y-5">
          <!-- Loading Progress Section -->
          <div
            v-if="isCopying"
            class="py-8 flex flex-col items-center justify-center text-center space-y-4"
          >
            <div class="relative flex items-center justify-center">
              <Loader2Icon class="w-10 h-10 text-cyan-400 animate-spin" />
            </div>
            <div class="space-y-1">
              <p class="font-bold text-sm text-foreground">
                {{ $t("exportReport.fetchProgress", { current: copyProgress, total: copyTotal }) }}
              </p>
              <p class="text-xs text-muted-foreground italic max-w-md truncate">
                {{ $t("exportReport.fetching", { game: copyCurrentGameName }) }}
              </p>
            </div>

            <!-- Progress Bar -->
            <div class="w-full max-w-md bg-muted rounded-full h-2.5 overflow-hidden">
              <div
                class="bg-cyan-500 h-full transition-all duration-300 ease-out"
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
              class="py-12 flex flex-col items-center justify-center text-center space-y-4"
            >
              <div class="p-3 bg-cyan-500/10 text-cyan-400 rounded-full">
                <FileTextIcon class="w-8 h-8" />
              </div>
              <UiButton @click="startExportReport">
                {{ $t("exportReport.generateBtn") }}
              </UiButton>
            </div>

            <!-- Report Text Area -->
            <div v-else class="space-y-2">
              <textarea
                readonly
                class="w-full h-80 p-3.5 rounded-xl border border-border/80 bg-neutral-900 text-neutral-100 font-mono text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                :value="copyReportText"
                placeholder="Report will appear here..."
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex items-center justify-between p-4 border-t border-border/60 bg-muted/20">
          <span class="text-xs text-muted-foreground">
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
              class="text-xs flex items-center gap-1.5"
            >
              <CopyIcon class="w-4 h-4" />
              <span>{{ $t("exportReport.copyBtn") }}</span>
            </UiButton>
            <span v-if="copiedSuccessfully" class="text-xs text-emerald-400 font-medium mr-2">
              ✓ {{ $t("exportReport.copied") }}
            </span>
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
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { Loader2Icon, FileTextIcon, CopyIcon, XIcon } from "@lucide/vue";
import type { SteamGame, GamesReportAchievementsTypes } from "~/types";

const props = defineProps<{
  games: SteamGame[];
}>();

const open = defineModel<boolean>("open", { default: false });

const apiKey = useSteamApiKey();
const steamId = useSteamId();
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
const copiedSuccessfully = ref(false);

// Cache for achievements to prevent redundant network requests
const achievementsCache = ref<Record<number, GamesReportAchievementsTypes.AchievementsCacheEntry>>(
  {},
);

function cancelExportReport() {
  isCopying.value = false;
}

// Helper to fetch achievements for a single game and update achievementsCache
async function fetchGameAchievements(
  game: SteamGame,
  apiKeyVal: string,
  steamIdVal: string,
  langVal: string,
) {
  if (achievementsCache.value[game.appid]) return;

  try {
    copyCurrentGameName.value = game.name;
    const response = await apiRepository.loadAchievements({
      appid: String(game.appid),
      apiKey: apiKeyVal.trim(),
      steamId: steamIdVal.trim(),
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

  const apiKeyVal = apiKey.value || "";
  const steamIdVal = steamId.value || "";
  const langVal = locale.value;

  const chunkSize = 5; // Fetch in chunks of 5 parallel requests to be friendly to Steam API

  for (let i = 0; i < props.games.length; i += chunkSize) {
    if (!isCopying.value) break;

    const chunk = props.games.slice(i, i + chunkSize);
    // eslint-disable-next-line no-await-in-loop
    await Promise.all(
      chunk.map((game) => fetchGameAchievements(game, apiKeyVal, steamIdVal, langVal)),
    );

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
  });

  copyReportText.value = text;
  copyTextToClipboard(text);
}

function copyTextToClipboard(text: string) {
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        copiedSuccessfully.value = true;
        setTimeout(() => {
          copiedSuccessfully.value = false;
        }, 3000);
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
