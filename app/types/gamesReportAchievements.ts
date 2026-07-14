import { useI18n } from "vue-i18n";
import type { SteamGame, SteamAchievement } from "./index";

export namespace GamesReportAchievementsTypes {
  export interface AchievementsCacheEntry {
    hasAchievements: boolean;
    achievements: SteamAchievement[];
    totalCount: number;
    unlockedCount: number;
    unlockedPercent: number;
  }

  export interface GameReportAchievements {
    game: SteamGame;
    hasAchievements: boolean;
    achievements: SteamAchievement[];
    totalCount: number;
    unlockedCount: number;
    unlockedPercent: number;
  }

  export type TranslationFn = ReturnType<typeof useI18n>["t"];

  export interface GameReportAchievementsParams {
    results: GameReportAchievements[];
    totalCount: number;
    totalHours: number;
    t: TranslationFn;
  }
}
