import { defineEventHandler, getQuery } from 'h3';

function getRelativeTime(timestamp: number, lang: string): string {
  const isUa = lang === 'uk' || lang === 'ukrainian';
  const isRu = lang === 'ru' || lang === 'russian';

  if (!timestamp || timestamp === 0) {
    if (isUa) return 'Ніколи';
    if (isRu) return 'Никогда';
    return 'Never';
  }
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  
  if (diff < 0 || diff < 60) {
    if (isUa) return 'Щойно';
    if (isRu) return 'Только что';
    return 'Just now';
  }
  
  const mins = Math.floor(diff / 60);
  if (mins < 60) {
    if (isUa) return `${mins} хв. тому`;
    if (isRu) return `${mins} мин. назад`;
    return `${mins}m ago`;
  }
  
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    if (isUa) return `${hours} год. тому`;
    if (isRu) return `${hours} ч. назад`;
    return `${hours}h ago`;
  }
  
  const days = Math.floor(hours / 24);
  if (days === 1) {
    if (isUa) return 'Вчора';
    if (isRu) return 'Вчера';
    return 'Yesterday';
  }
  if (days < 30) {
    if (isUa) return `${days} дн. тому`;
    if (isRu) return `${days} дн. назад`;
    return `${days}d ago`;
  }
  
  const months = Math.floor(days / 30);
  if (months === 1) {
    if (isUa) return '1 місяць тому';
    if (isRu) return '1 месяц назад';
    return '1 month ago';
  }
  if (months < 12) {
    if (isUa) return `${months} міс. тому`;
    if (isRu) return `${months} мес. назад`;
    return `${months} months ago`;
  }
  
  const years = Math.floor(months / 12);
  if (years === 1) {
    if (isUa) return '1 рік тому';
    if (isRu) return '1 год назад';
    return '1 year ago';
  }
  if (isUa) return `${years} р. тому`;
  if (isRu) return `${years} г. назад`;
  return `${years} years ago`;
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  
  // Read from query or environment variables
  const apiKey = (query.apiKey as string) || process.env.STEAM_API_KEY;
  const steamId = (query.steamId as string) || process.env.STEAM_ID;
  const rawLang = (query.lang as string) || process.env.STEAM_LANGUAGE || 'uk';
  
  let steamLang = 'ukrainian';
  if (rawLang === 'en' || rawLang === 'english') {
    steamLang = 'english';
  } else if (rawLang === 'ru' || rawLang === 'russian') {
    steamLang = 'russian';
  } else if (rawLang === 'uk' || rawLang === 'ukrainian') {
    steamLang = 'ukrainian';
  } else {
    steamLang = 'english';
  }
  
  if (!apiKey || !steamId) {
    return {
      success: false,
      error: 'Missing Steam API Key or Steam ID. Please configure them in .env or provide them in settings.'
    };
  }
  
  try {
    const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamId}&format=json&include_appinfo=true&include_played_free_games=true&l=${steamLang}`;
    
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
    const playedGamesList = rawGames.filter((game) => game.playtime_forever > 0);
    
    // Fetch achievements progress in batches of 50 to stay within URL/param limits
    const achievementMap = new Map<number, { total: number, unlocked: number }>();
    try {
      const appids = playedGamesList.map((g) => g.appid);
      const chunkSize = 50;
      const chunks: number[][] = [];
      for (let i = 0; i < appids.length; i += chunkSize) {
        chunks.push(appids.slice(i, i + chunkSize));
      }
      
      const batchPromises = chunks.map(async (chunk) => {
        let chunkParams = `key=${apiKey}&steamid=${steamId}&max_achievements=2000`;
        chunk.forEach((appid, index) => {
          chunkParams += `&appids[${index}]=${appid}`;
        });
        
        const batchUrl = `https://api.steampowered.com/IPlayerService/GetTopAchievementsForGames/v1/?${chunkParams}`;
        const res: any = await $fetch(batchUrl).catch((err) => {
          console.warn('Error fetching achievements batch:', err.message);
          return null;
        });
        return res;
      });
      
      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach((res) => {
        if (res?.response?.games) {
          res.response.games.forEach((gameRes: any) => {
            const appid = gameRes.appid;
            const total = gameRes.total_achievements || 0;
            const unlocked = gameRes.achievements ? gameRes.achievements.length : 0;
            achievementMap.set(appid, { total, unlocked });
          });
        }
      });
    } catch (err) {
      console.error('Error fetching batch achievements:', err);
    }

    // Process and filter games
    const games = playedGamesList.map((game) => {
      const appid = game.appid;
      const playtimeMinutes = game.playtime_forever || 0;
      const playtimeHours = Math.round((playtimeMinutes / 60) * 10) / 10;
      const achInfo = achievementMap.get(appid) || { total: 0, unlocked: 0 };
      
      return {
        appid,
        name: game.name || `App ${appid}`,
        playtime_forever: playtimeMinutes,
        playtime_2weeks: game.playtime_2weeks || 0,
        img_icon_url: game.img_icon_url || '',
        rtime_last_played: game.rtime_last_played || 0,
        header_img: `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appid}/header.jpg`,
        playtime_hours: playtimeHours,
        last_played_relative: getRelativeTime(game.rtime_last_played || 0, rawLang),
        achievements_total: achInfo.total,
        achievements_unlocked: achInfo.unlocked,
        has_achievements: achInfo.total > 0,
        is_perfect: achInfo.total > 0 && achInfo.unlocked === achInfo.total
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
