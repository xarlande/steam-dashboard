import { getRelativeTime } from "./relativeTime";
import { convertMinutesToHours } from "./playtime";

export function processSteamGames(rawGames: any[], rawLang: string) {
  // Process and filter games
  const games = rawGames
    .filter((game) => game.playtime_forever > 0) // Only games that have been played
    .map((game) => {
      const appid = game.appid;
      const playtimeMinutes = game.playtime_forever || 0;
      const playtimeHours = convertMinutesToHours(playtimeMinutes);

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
  const totalPlaytimeHours = convertMinutesToHours(totalPlaytimeMinutes);

  return {
    games,
    totalPlaytimeHours,
  };
}
