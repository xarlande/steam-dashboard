import type { SteamApiResponse, GameAchievementsResponse } from "~/types";

export default {
  async loadGames(query: { lang: string }) {
    return await $fetch<SteamApiResponse>(`/api/steam/games`, {
      query,
    });
  },
  async loadAchievements(query: { lang: string; appid: string }) {
    return await $fetch<GameAchievementsResponse>("/api/steam/achievements", {
      query,
    });
  },
};
