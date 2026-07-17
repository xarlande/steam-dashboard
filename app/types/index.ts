export type {
  SteamGame,
  SteamApiResponse,
  SteamAchievement,
  GameAchievementsResponse,
  GamesRequestData,
} from "#shared/types";

export namespace GameTypes {
  export enum Category {
    Story = "story",
    Session = "session",
  }

  export enum SortKey {
    LastPlayed = "lastPlayed",
    PlaytimeDesc = "playtimeDesc",
    PlaytimeAsc = "playtimeAsc",
    Name = "name",
  }

  export enum AchievementFilter {
    All = "all",
    Unlocked = "unlocked",
    Locked = "locked",
  }
}

export * from "./gamesReportAchievements";
