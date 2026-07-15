import { ref, computed, watch, toValue, type MaybeRefOrGetter, type Ref } from "vue";
import { useI18n } from "vue-i18n";
import { toast } from "vue-sonner";
import type { SteamGame, GamesReportAchievementsTypes } from "~/types";

export function useAchievementsExport(
  gamesInput: MaybeRefOrGetter<SteamGame[]>,
  includeAchievements: Ref<boolean>,
) {
  const { locale, t } = useI18n();

  const games = computed(() => toValue(gamesInput));

  const totalCount = computed(() => games.value.length);
  const totalHours = computed(() => {
    return games.value.reduce((sum, g) => sum + (g.playtime_hours || 0), 0);
  });

  const isCopying = ref(false);
  const copyProgress = ref(0);
  const copyTotal = ref(0);
  const copyCurrentGameName = ref("");
  const copyReportText = ref("");

  const achievementsCache = ref<
    Record<number, GamesReportAchievementsTypes.AchievementsCacheEntry>
  >({});

  function cancelExportReport() {
    isCopying.value = false;
  }

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

    achievementsCache.value[game.appid] = {
      hasAchievements: false,
      achievements: [],
      totalCount: 0,
      unlockedCount: 0,
      unlockedPercent: 0,
    };
  }

  async function startExportReport() {
    if (games.value.length === 0) return;

    isCopying.value = true;
    copyProgress.value = 0;
    copyTotal.value = games.value.length;
    copyReportText.value = "";

    const langVal = locale.value;
    const chunkSize = 5;

    for (let i = 0; i < games.value.length; i += chunkSize) {
      if (!isCopying.value) break;

      const chunk = games.value.slice(i, i + chunkSize);
      // eslint-disable-next-line no-await-in-loop
      await Promise.all(chunk.map((game) => fetchGameAchievements(game, langVal)));

      copyProgress.value = Math.min(i + chunkSize, games.value.length);
    }

    if (isCopying.value) {
      isCopying.value = false;
      regenerateReport();
    }
  }

  function regenerateReport() {
    const results: GamesReportAchievementsTypes.GameReportAchievements[] = games.value.map(
      (game) => {
        const cache = achievementsCache.value[game.appid];
        return {
          game,
          hasAchievements: cache ? cache.hasAchievements : false,
          achievements: cache ? cache.achievements : [],
          totalCount: cache ? cache.totalCount : 0,
          unlockedCount: cache ? cache.unlockedCount : 0,
          unlockedPercent: cache ? cache.unlockedPercent : 0,
        };
      },
    );

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

  watch(includeAchievements, () => {
    if (copyReportText.value) {
      regenerateReport();
    }
  });

  return {
    totalCount,
    totalHours,
    isCopying,
    copyProgress,
    copyTotal,
    copyCurrentGameName,
    copyReportText,
    startExportReport,
    cancelExportReport,
    copyTextToClipboard,
  };
}
