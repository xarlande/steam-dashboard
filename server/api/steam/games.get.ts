import { defineEventHandler, getQuery } from 'h3';

function getRelativeTime(timestamp: number): string {
  if (!timestamp || timestamp === 0) return 'Never';
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  
  if (diff < 0) return 'Just now'; // handle time sync issues
  if (diff < 60) return 'Just now';
  
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins}m ago`;
  
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  
  const months = Math.floor(days / 30);
  if (months === 1) return '1 month ago';
  if (months < 12) return `${months} months ago`;
  
  const years = Math.floor(months / 12);
  if (years === 1) return '1 year ago';
  return `${years} years ago`;
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  
  // Read from query or environment variables
  const apiKey = (query.apiKey as string) || process.env.STEAM_API_KEY;
  const steamId = (query.steamId as string) || process.env.STEAM_ID;
  
  if (!apiKey || !steamId) {
    return {
      success: false,
      error: 'Missing Steam API Key or Steam ID. Please configure them in .env or provide them in settings.'
    };
  }
  
  try {
    const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamId}&format=json&include_appinfo=true&include_played_free_games=true`;
    
    const data: any = await $fetch(url).catch((err) => {
      console.error('Steam API Fetch error:', err);
      throw new Error(err.message || 'Failed to fetch data from Steam API');
    });
    
    if (!data?.response || !data.response.games) {
      // Sometimes Steam returns an empty response if the profile is private
      return {
        success: false,
        error: 'No games found. Please make sure your Steam Profile and Game Details are set to "Public" in your Steam Privacy Settings.'
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
          img_icon_url: game.img_icon_url || '',
          rtime_last_played: game.rtime_last_played || 0,
          header_img: `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appid}/header.jpg`,
          playtime_hours: playtimeHours,
          last_played_relative: getRelativeTime(game.rtime_last_played || 0)
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
      usingEnv: !query.apiKey && !query.steamId && !!process.env.STEAM_API_KEY && !!process.env.STEAM_ID
    };
  } catch (error: any) {
    console.error('Error fetching Steam games:', error);
    return {
      success: false,
      error: error.message || 'An error occurred while fetching your Steam games library.'
    };
  }
});
