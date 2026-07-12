import type { SteamApiResponse } from "~/types";

export default {
  async loadGames(query: { lang: string; steamId: string; apiKey: string }) {
    return await $fetch<SteamApiResponse>(`/api/steam/games`, {
      query,
    });
  },
  async loadAchievements(query: { lang: string; steamId: string; apiKey: string; appid: string }) {
    return await $fetch("/api/steam/achievements", {
      query,
    });
  },
};
