import { GameTypes, type SteamGame } from "@/types";

export const sortComparators: Record<GameTypes.SortKey, (a: SteamGame, b: SteamGame) => number> = {
  [GameTypes.SortKey.LastPlayed]: (a, b) => b.rtime_last_played - a.rtime_last_played,
  [GameTypes.SortKey.PlaytimeDesc]: (a, b) => b.playtime_forever - a.playtime_forever,
  [GameTypes.SortKey.PlaytimeAsc]: (a, b) => a.playtime_forever - b.playtime_forever,
  [GameTypes.SortKey.Name]: (a, b) => a.name.localeCompare(b.name),
};
