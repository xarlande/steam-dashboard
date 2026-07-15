import type { SteamApiResponse, GameAchievementsResponse } from "~/types";

export default {
  async loadGames(query: { lang: string }) {
    return await useNuxtApp().$api<SteamApiResponse>(`/api/steam/games`, {
      query,
    });
  },
  async loadAchievements(query: { lang: string; appid: string }) {
    return await useNuxtApp().$api<GameAchievementsResponse>("/api/steam/achievements", {
      query,
    });
  },
};
