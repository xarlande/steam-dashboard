import { defineEventHandler, getQuery, getCookie } from "h3";
import { mergeAchievements } from "#shared/steamAchievements";
import { mapSteamLocale } from "#shared/steamLocale";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const appid = query.appid as string;
  const apiKey = process.env.STEAM_API_KEY;
  const steamId = getCookie(event, "steam_id") || process.env.STEAM_ID;
  const rawLang = (query.lang as string) || "uk";

  const steamLang = mapSteamLocale(rawLang);

  if (!appid) {
    return {
      success: false,
      error: "Missing App ID parameter.",
    };
  }

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
    // Fetch all three endpoints in parallel using Promise.allSettled for robustness
    const results = await Promise.allSettled([
      steamApiRepository.getPlayerAchievements(appid, apiKey, steamId, steamLang),
      steamApiRepository.getSchemaForGame(appid, apiKey, steamLang),
      steamApiRepository.getGlobalAchievementPercentages(appid),
    ]);
    const playerResult = results[0] as PromiseSettledResult<any>;
    const schemaResult = results[1] as PromiseSettledResult<any>;
    const globalResult = results[2] as PromiseSettledResult<any>;

    // 1. Handle Player Achievements status
    if (playerResult.status === "rejected") {
      const errMessage = sanitizeError(playerResult.reason);
      console.error(`Error fetching player achievements for app ${appid}:`, errMessage);

      // Look for common Steam API responses embedded in error
      if (errMessage.includes("400") || errMessage.includes("403") || errMessage.includes("500")) {
        return {
          success: false,
          error:
            'Could not retrieve achievements. Make sure your Steam Profile and Game Details are set to "Public" in your Steam Privacy settings, or check your API key.',
        };
      }
      return {
        success: false,
        error: "Failed to retrieve achievements from Steam API.",
      };
    }

    const playerData = playerResult.value;

    if (playerData?.playerstats?.success === false) {
      const errMsg = playerData.playerstats.error || "";
      if (
        errMsg.includes("not available for this user") ||
        errMsg.includes("Requested dataset is not available")
      ) {
        return {
          success: false,
          error:
            "This profile details or achievements list is set to private. Change your Steam privacy settings to public to view achievements.",
        };
      }

      if (errMsg.includes("has no stats") || errMsg.includes("no achievements")) {
        return {
          success: true,
          achievements: [],
          total_count: 0,
          unlocked_count: 0,
          unlocked_percent: 0,
          gameName: "Unknown Game",
        };
      }

      return {
        success: false,
        error: errMsg || "Steam API returned an unsuccessful status.",
      };
    }

    const playerAchievements = playerData?.playerstats?.achievements || [];

    if (playerAchievements.length === 0) {
      return {
        success: true,
        achievements: [],
        total_count: 0,
        unlocked_count: 0,
        unlocked_percent: 0,
        gameName: playerData?.playerstats?.gameName || "Unknown Game",
      };
    }

    // 2. Handle Schema status
    let schemaAchievements: any[] = [];
    let gameName = playerData?.playerstats?.gameName || "";

    if (schemaResult.status === "fulfilled") {
      const schemaData = schemaResult.value;
      gameName = schemaData?.game?.gameName || gameName || "Unknown Game";
      schemaAchievements = schemaData?.game?.availableGameStats?.achievements || [];
    } else {
      console.warn(
        `Could not load schema for game ${appid}. Falling back to basic values.`,
        sanitizeError(schemaResult.reason),
      );
    }

    // Parse global percentages
    const globalPercentages = new Map<string, number>();
    if (globalResult.status === "fulfilled") {
      const globalData = globalResult.value;
      const pctList = globalData?.achievementpercentages?.achievements || [];
      pctList.forEach((item: any) => {
        if (item.name) {
          globalPercentages.set(item.name, Math.round((item.percent || 0) * 10) / 10);
        }
      });
    } else {
      console.warn(
        `Could not load global achievement percentages for game ${appid}.`,
        sanitizeError(globalResult.reason),
      );
    }

    const achievements = mergeAchievements({
      playerAchievements,
      schemaAchievements,
      globalPercentages,
      rawLang,
    });

    const unlockedCount = achievements.filter((a: any) => a.achieved).length;
    const totalCount = achievements.length;
    const unlockedPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

    return {
      success: true,
      gameName,
      achievements,
      total_count: totalCount,
      unlocked_count: unlockedCount,
      unlocked_percent: unlockedPercent,
    };
  } catch (error: any) {
    const sanitized = sanitizeError(error);
    console.error(`Error processing achievements for game ${appid}:`, sanitized);
    return {
      success: false,
      error: sanitized || "An unexpected error occurred while loading achievements.",
    };
  }
});
