import { computed, type MaybeRefOrGetter, toValue } from "vue";
import { GameTypes, type SteamGame } from "~/types";
import { convertMinutesToHours } from "#shared/playtime";

export type TopGamesLimit = 5 | 10 | 15 | 20 | "all";

export function useAnalytics(
  gamesInput: MaybeRefOrGetter<SteamGame[]>,
  periodInput: MaybeRefOrGetter<"recent" | "allTime">,
  limitInput?: MaybeRefOrGetter<TopGamesLimit>,
) {
  const { getGameCategory } = useGameCategories();
  const { isGameHidden } = useAnalyticsExclusions();

  const allGames = computed(() => toValue(gamesInput));
  const period = computed(() => toValue(periodInput));
  const limit = computed(() => toValue(limitInput) ?? 5);

  // Filter games excluding any hidden from analytics
  const visibleGames = computed(() => {
    return allGames.value.filter((g) => !isGameHidden(g.appid));
  });

  // Recently played games computed values (visible only)
  const recentlyPlayedGames = computed(() => {
    return visibleGames.value.filter((g) => g.playtime_2weeks && g.playtime_2weeks > 0);
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

  const recentStoryHours = computed(() => convertMinutesToHours(recentStoryMinutes.value));
  const recentSessionHours = computed(() => convertMinutesToHours(recentSessionMinutes.value));
  const recentTotalHours = computed(() =>
    Math.round((recentStoryHours.value + recentSessionHours.value) * 10) / 10,
  );

  // All time computed values (visible only)
  const allTimeStoryHours = computed(() => {
    const mins = visibleGames.value.reduce(
      (sum, g) =>
        getGameCategory(g) === GameTypes.Category.Story ? sum + g.playtime_forever : sum,
      0,
    );
    return convertMinutesToHours(mins);
  });

  const allTimeSessionHours = computed(() => {
    const mins = visibleGames.value.reduce(
      (sum, g) =>
        getGameCategory(g) === GameTypes.Category.Session ? sum + g.playtime_forever : sum,
      0,
    );
    return convertMinutesToHours(mins);
  });

  const allTimeTotalHours = computed(() => {
    return Math.round((allTimeStoryHours.value + allTimeSessionHours.value) * 10) / 10;
  });

  // Active computed hours & percentage metrics
  const activeStoryHours = computed(() => {
    return period.value === "recent" ? recentStoryHours.value : allTimeStoryHours.value;
  });

  const activeSessionHours = computed(() => {
    return period.value === "recent" ? recentSessionHours.value : allTimeSessionHours.value;
  });

  const activeTotalHours = computed(() => {
    return period.value === "recent" ? recentTotalHours.value : allTimeTotalHours.value;
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

  // Dynamic Top Games
  const topGames = computed(() => {
    if (visibleGames.value.length === 0) return [];

    let sorted: Array<SteamGame & { display_hours: number }> = [];

    if (period.value === "recent") {
      const playedRecent = visibleGames.value.filter((g) => g.playtime_2weeks && g.playtime_2weeks > 0);
      const sortedRaw = [...playedRecent].sort(
        (a, b) => (b.playtime_2weeks || 0) - (a.playtime_2weeks || 0),
      );
      sorted = sortedRaw.map((g) => {
        const recentHours = convertMinutesToHours(g.playtime_2weeks || 0);
        return Object.assign({}, g, { display_hours: recentHours });
      });
    } else {
      const sortedRaw = [...visibleGames.value].sort(
        (a, b) => b.playtime_forever - a.playtime_forever,
      );
      sorted = sortedRaw.map((g) => {
        return Object.assign({}, g, { display_hours: g.playtime_hours });
      });
    }

    if (limit.value === "all") {
      return sorted;
    }
    const numLimit = typeof limit.value === "number" ? limit.value : 5;
    return sorted.slice(0, numLimit);
  });

  const topMaxPlaytime = computed(() => {
    if (topGames.value.length === 0) return 1;
    return topGames.value[0]?.display_hours || 1;
  });

  return {
    visibleGames,
    recentlyPlayedGames,
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
  };
}
