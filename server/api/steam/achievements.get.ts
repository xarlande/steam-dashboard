import { defineEventHandler, getQuery } from 'h3';

function getRelativeTime(timestamp: number): string {
  if (!timestamp || timestamp === 0) return 'Never';
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  
  if (diff < 0) return 'Just now';
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
  
  const appid = query.appid as string;
  const apiKey = (query.apiKey as string) || process.env.STEAM_API_KEY;
  const steamId = (query.steamId as string) || process.env.STEAM_ID;
  const lang = (query.lang as string) || process.env.STEAM_LANGUAGE || 'ukrainian';
  
  if (!appid) {
    return {
      success: false,
      error: 'Missing App ID parameter.'
    };
  }
  
  if (!apiKey || !steamId) {
    return {
      success: false,
      error: 'Missing Steam API Key or Steam ID. Please enter them in config settings.'
    };
  }
  
  const playerUrl = `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?appid=${appid}&key=${apiKey}&steamid=${steamId}&l=${lang}`;
  const schemaUrl = `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?appid=${appid}&key=${apiKey}&l=${lang}`;
  
  try {
    // Fetch both endpoints in parallel using Promise.allSettled for robustness
    const [playerResult, schemaResult] = await Promise.allSettled([
      $fetch<any>(playerUrl),
      $fetch<any>(schemaUrl)
    ]);
    
    // 1. Handle Player Achievements status
    if (playerResult.status === 'rejected') {
      const errMessage = playerResult.reason?.message || '';
      console.error(`Error fetching player achievements for app ${appid}:`, playerResult.reason);
      
      // Look for common Steam API responses embedded in error
      if (errMessage.includes('400') || errMessage.includes('403') || errMessage.includes('500')) {
        return {
          success: false,
          error: 'Could not retrieve achievements. Make sure your Steam Profile and Game Details are set to "Public" in your Steam Privacy settings, or check your API key.'
        };
      }
      return {
        success: false,
        error: 'Failed to retrieve achievements from Steam API.'
      };
    }
    
    const playerData = playerResult.value;
    
    if (playerData?.playerstats?.success === false) {
      const errMsg = playerData.playerstats.error || '';
      if (errMsg.includes('not available for this user') || errMsg.includes('Requested dataset is not available')) {
        return {
          success: false,
          error: 'This profile details or achievements list is set to private. Change your Steam privacy settings to public to view achievements.'
        };
      }
      
      if (errMsg.includes('has no stats') || errMsg.includes('no achievements')) {
        return {
          success: true,
          achievements: [],
          total_count: 0,
          unlocked_count: 0,
          unlocked_percent: 0,
          gameName: 'Unknown Game'
        };
      }
      
      return {
        success: false,
        error: errMsg || 'Steam API returned an unsuccessful status.'
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
        gameName: playerData?.playerstats?.gameName || 'Unknown Game'
      };
    }
    
    // 2. Handle Schema status
    let schemaAchievements: any[] = [];
    let gameName = playerData?.playerstats?.gameName || '';
    
    if (schemaResult.status === 'fulfilled') {
      const schemaData = schemaResult.value;
      gameName = schemaData?.game?.gameName || gameName || 'Unknown Game';
      schemaAchievements = schemaData?.game?.availableGameStats?.achievements || [];
    } else {
      console.warn(`Could not load schema for game ${appid}. Falling back to basic values.`, schemaResult.reason);
    }
    
    // Create lookup map for schema details
    const schemaMap = new Map<string, any>();
    schemaAchievements.forEach((item) => {
      schemaMap.set(item.name, item);
    });
    
    // 3. Merge player status and schema details
    const achievements = playerAchievements.map((playerAch: any) => {
      const schemaAch = schemaMap.get(playerAch.apiname) || {};
      const achieved = playerAch.achieved === 1;
      
      return {
        apiname: playerAch.apiname,
        name: schemaAch.displayName || playerAch.apiname,
        description: schemaAch.description || '',
        achieved,
        unlocktime: playerAch.unlocktime || 0,
        unlocktime_relative: achieved ? getRelativeTime(playerAch.unlocktime) : 'Locked',
        icon: schemaAch.icon || 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/252490/achievements/default.jpg',
        icongray: schemaAch.icongray || 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/252490/achievements/default.jpg'
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
    
    const unlockedCount = achievements.filter((a: any) => a.achieved).length;
    const totalCount = achievements.length;
    const unlockedPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;
    
    return {
      success: true,
      gameName,
      achievements,
      total_count: totalCount,
      unlocked_count: unlockedCount,
      unlocked_percent: unlockedPercent
    };
  } catch (error: any) {
    console.error(`Error processing achievements for game ${appid}:`, error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred while loading achievements.'
    };
  }
});
