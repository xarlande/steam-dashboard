import { defineEventHandler, getQuery, getCookie } from "h3";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  // Read from query or environment variables
  const apiKey = process.env.STEAM_API_KEY;
  const steamId = getCookie(event, "steam_id") || process.env.STEAM_ID;
  const rawLang = (query.lang as string) || "uk";

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
    const data: any = await steamApiRepository
      .getOwnedGames(apiKey, steamId, steamLang)
      .catch((err) => {
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

    const { games, totalPlaytimeHours } = processSteamGames(rawGames, rawLang);

    const result = {
      success: true,
      games,
      total_count: games.length,
      total_playtime_hours: totalPlaytimeHours,
      usingEnv: !getCookie(event, "steam_id") && !!process.env.STEAM_ID,
    };

    return result;
  } catch (error: any) {
    const sanitized = sanitizeError(error);
    console.error("Error fetching Steam games:", sanitized);
    return {
      success: false,
      error: sanitized || "An error occurred while fetching your Steam games library.",
    };
  }
});
