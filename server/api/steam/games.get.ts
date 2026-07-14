import { defineEventHandler, getQuery, getCookie } from "h3";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  // Read from query or environment variables
  const apiKey = process.env.STEAM_API_KEY;
  const rawSteamId = getCookie(event, "steam_id") || process.env.STEAM_ID;
  const steamId = parseCookieValue(rawSteamId);
  const rawLang = (query.lang as string) || process.env.STEAM_LANGUAGE || "uk";

  const steamLang = mapSteamLocale(rawLang);

  if (!apiKey) {
    return {
      success: false,
      error: "Missing server STEAM_API_KEY. Please set it in your server .env file.",
    };
  }

  if (!steamId) {
    return {
      success: false,
      error: "Missing Steam ID. Please enter it in config settings.",
    };
  }

  try {
    const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamId}&format=json&include_appinfo=true&include_played_free_games=true&l=${steamLang}`;

    const data: any = await $fetch(url).catch((err) => {
      const sanitized = sanitizeError(err);
      console.error("Steam API Fetch error:", sanitized);
      throw new Error(sanitized || "Failed to fetch data from Steam API");
    });

    if (!data?.response || !data.response.games) {
      // Sometimes Steam returns an empty response if the profile is private
      return {
        success: false,
        error:
          'No games found. Please make sure your Steam Profile and Game Details are set to "Public" in your Steam Privacy Settings.',
      };
    }

    const rawGames = data.response.games as any[];

    // Process and filter games
    const games = rawGames
      .filter((game) => game.playtime_forever > 0) // Only games that have been played
      .map((game) => {
        const appid = game.appid;
        const playtimeMinutes = game.playtime_forever || 0;
        const playtimeHours = Math.round((playtimeMinutes / 60) * 10) / 10;

        return {
          appid,
          name: game.name || `App ${appid}`,
          playtime_forever: playtimeMinutes,
          playtime_2weeks: game.playtime_2weeks || 0,
          img_icon_url: game.img_icon_url || "",
          rtime_last_played: game.rtime_last_played || 0,
          header_img: `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appid}/header.jpg`,
          playtime_hours: playtimeHours,
          last_played_relative: getRelativeTime(game.rtime_last_played || 0, rawLang),
        };
      });

    // Sort by rtime_last_played in descending order (most recently played first)
    games.sort((a, b) => b.rtime_last_played - a.rtime_last_played);

    // Calculate total playtime
    const totalPlaytimeMinutes = games.reduce((acc, game) => acc + game.playtime_forever, 0);
    const totalPlaytimeHours = Math.round((totalPlaytimeMinutes / 60) * 10) / 10;

    return {
      success: true,
      games,
      total_count: games.length,
      total_playtime_hours: totalPlaytimeHours,
      usingEnv: !getCookie(event, "steam_id") && !!process.env.STEAM_ID,
    };
  } catch (error: any) {
    const sanitized = sanitizeError(error);
    console.error("Error fetching Steam games:", sanitized);
    return {
      success: false,
      error: sanitized || "An error occurred while fetching your Steam games library.",
    };
  }
});
