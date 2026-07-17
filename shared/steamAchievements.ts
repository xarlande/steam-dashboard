import { getRelativeTime } from "./relativeTime";
import { isUkrainian, isRussian } from "./steamLocale";
import type { SteamAchievement } from "./types";

interface MergeAchievementsParams {
  playerAchievements: any[];
  schemaAchievements: any[];
  globalPercentages: Map<string, number>;
  rawLang: string;
}

export function mergeAchievements({
  playerAchievements,
  schemaAchievements,
  globalPercentages,
  rawLang,
}: MergeAchievementsParams): SteamAchievement[] {
  const isUa = isUkrainian(rawLang);
  const isRu = isRussian(rawLang);

  // Create lookup map for schema details
  const schemaMap = new Map<string, any>();
  schemaAchievements.forEach((item) => {
    schemaMap.set(item.name, item);
  });

  // Merge player status and schema details
  const achievements = playerAchievements.map((playerAch: any) => {
    const schemaAch = schemaMap.get(playerAch.apiname) || {};
    const achieved = playerAch.achieved === 1;
    const global_percent = globalPercentages.get(playerAch.apiname) || 0;

    return {
      apiname: playerAch.apiname,
      name: schemaAch.displayName || playerAch.apiname,
      description: schemaAch.description || "",
      achieved,
      unlocktime: playerAch.unlocktime || 0,
      unlocktime_relative: achieved
        ? getRelativeTime(playerAch.unlocktime, rawLang)
        : isUa
          ? "Заблоковано"
          : isRu
            ? "Заблокировано"
            : "Locked",
      icon:
        schemaAch.icon ||
        "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/252490/achievements/default.jpg",
      icongray:
        schemaAch.icongray ||
        "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/252490/achievements/default.jpg",
      global_percent,
    };
  });

  // Sort: Unlocked first (by unlock time descending), then locked
  achievements.sort((a: any, b: any) => {
    if (a.achieved && !b.achieved) return -1;
    if (!a.achieved && b.achieved) return 1;
    if (a.achieved && b.achieved) {
      return b.unlocktime - a.unlocktime; // newest unlocked first
    }
    return a.name.localeCompare(b.name); // alphabetical for locked
  });

  return achievements;
}
