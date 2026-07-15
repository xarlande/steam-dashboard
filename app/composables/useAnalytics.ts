import { computed, type MaybeRefOrGetter, toValue } from "vue";
import { GameTypes, type SteamGame } from "~/types";
import { convertMinutesToHours } from "#shared/playtime";

export function useAnalytics(
  gamesInput: MaybeRefOrGetter<SteamGame[]>,
  periodInput: MaybeRefOrGetter<"recent" | "allTime">,
) {
  const { getGameCategory } = useGameCategories();

  const games = computed(() => toValue(gamesInput));
  const period = computed(() => toValue(periodInput));

  // Reuse the useLibraryDetox calculations for recent stats
  const { recentlyPlayedGames, recentStoryHours, recentSessionHours, recentTotalHours } =
    useLibraryDetox(games);

  // All time computed values
  const allTimeStoryHours = computed(() => {
    const mins = games.value.reduce(
      (sum, g) =>
        getGameCategory(g) === GameTypes.Category.Story ? sum + g.playtime_forever : sum,
      0,
    );
    return convertMinutesToHours(mins);
  });

  const allTimeSessionHours = computed(() => {
    const mins = games.value.reduce(
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

  // Dynamic Top 5 Games
  const topFiveGames = computed(() => {
    if (games.value.length === 0) return [];

    if (period.value === "recent") {
      const playedRecent = games.value.filter((g) => g.playtime_2weeks && g.playtime_2weeks > 0);
      const sorted = [...playedRecent]
        .sort((a, b) => (b.playtime_2weeks || 0) - (a.playtime_2weeks || 0))
        .slice(0, 5);

      return sorted.map((g) => {
        const recentHours = convertMinutesToHours(g.playtime_2weeks || 0);
        return Object.assign({}, g, { display_hours: recentHours });
      });
    } else {
      const sorted = [...games.value]
        .sort((a, b) => b.playtime_forever - a.playtime_forever)
        .slice(0, 5);

      return sorted.map((g) => {
        return Object.assign({}, g, { display_hours: g.playtime_hours });
      });
    }
  });

  const topFiveMaxPlaytime = computed(() => {
    if (topFiveGames.value.length === 0) return 1;
    return topFiveGames.value[0]?.display_hours || 1;
  });

  return {
    recentlyPlayedGames,
    activeStoryHours,
    activeSessionHours,
    activeTotalHours,
    activeStoryPercent,
    activeSessionPercent,
    donutStoryDash,
    donutSessionDash,
    donutSessionOffset,
    topFiveGames,
    topFiveMaxPlaytime,
  };
}
