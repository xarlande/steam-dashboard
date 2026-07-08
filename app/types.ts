export interface SteamGame {
  appid: number;
  name: string;
  playtime_forever: number; // in minutes
  playtime_2weeks?: number; // in minutes
  img_icon_url?: string;
  rtime_last_played: number; // Unix timestamp
  header_img: string; // pre-computed URL
  playtime_hours: number; // pre-computed
  last_played_relative: string; // pre-computed string
}

export interface SteamApiResponse {
  success: boolean;
  games?: SteamGame[];
  total_count?: number;
  total_playtime_hours?: number;
  usingEnv?: boolean;
  error?: string;
}

export interface SteamAchievement {
  apiname: string;
  name: string; // display name
  description: string;
  achieved: boolean;
  unlocktime: number;
  unlocktime_relative: string;
  icon: string; // colored icon url
  icongray: string; // grayscale icon url
  global_percent?: number;
}

export interface GameAchievementsResponse {
  success: boolean;
  gameName?: string;
  achievements?: SteamAchievement[];
  total_count?: number;
  unlocked_count?: number;
  unlocked_percent?: number;
  error?: string;
}
