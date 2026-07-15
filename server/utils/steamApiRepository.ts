export const steamApiRepository = {
  async getOwnedGames(apiKey: string, steamId: string, steamLang: string) {
    const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamId}&format=json&include_appinfo=true&include_played_free_games=true&l=${steamLang}`;
    return await $fetch<any>(url);
  },

  async getPlayerAchievements(appid: string, apiKey: string, steamId: string, steamLang: string) {
    const url = `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?appid=${appid}&key=${apiKey}&steamid=${steamId}&l=${steamLang}`;
    return await $fetch<any>(url);
  },

  async getSchemaForGame(appid: string, apiKey: string, steamLang: string) {
    const url = `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?appid=${appid}&key=${apiKey}&l=${steamLang}`;
    return await $fetch<any>(url);
  },

  async getGlobalAchievementPercentages(appid: string) {
    const url = `https://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/?gameid=${appid}&format=json`;
    return await $fetch<any>(url);
  },
};
