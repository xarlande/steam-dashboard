import { computed, type MaybeRefOrGetter, toValue } from "vue";
import { GameTypes, type SteamGame } from "~/types";

export function useLibraryDetox(gamesInput: MaybeRefOrGetter<SteamGame[]>) {
  const { getGameCategory } = useGameCategories();

  const games = computed(() => toValue(gamesInput));

  const recentlyPlayedGames = computed(() =>
    games.value.filter((g) => g.playtime_2weeks && g.playtime_2weeks > 0),
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
  const recentSessionHours = computed(
    () => Math.round((recentSessionMinutes.value / 60) * 10) / 10,
  );
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

  return {
    recentlyPlayedGames,
    recentStoryHours,
    recentSessionHours,
    recentTotalHours,
    storyPercentage,
    hygieneStatus,
  };
}
