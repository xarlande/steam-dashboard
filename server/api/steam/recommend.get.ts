import { defineEventHandler, getQuery } from 'h3';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  
  // Read config parameters
  const apiKey = (query.apiKey as string) || process.env.STEAM_API_KEY;
  const steamId = (query.steamId as string) || process.env.STEAM_ID;
  const lang = (query.lang as string) || process.env.STEAM_LANGUAGE || 'ukrainian';
  const time = (query.time as string) || '2-5'; // '1-2', '2-5', '5+'
  const mood = (query.mood as string) || 'story'; // 'story', 'challenge', 'casual'
  
  if (!apiKey || !steamId) {
    return {
      success: false,
      error: 'Missing Steam API Key or Steam ID.'
    };
  }
  
  try {
    // 1. Fetch all owned games from Steam Web API
    const ownedGamesUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamId}&format=json&include_appinfo=true&include_played_free_games=true&l=${lang}`;
    
    const ownedData: any = await $fetch(ownedGamesUrl).catch((err) => {
      console.error('Error querying GetOwnedGames for recommendations:', err);
      throw new Error('Failed to retrieve library from Steam.');
    });
    
    if (!ownedData?.response?.games) {
      return {
        success: false,
        error: 'No games found in this library. Make sure details are set to public.'
      };
    }
    
    const games = ownedData.response.games as any[];
    
    // 2. Filter backlog games (playtime < 50 hours, i.e., 3000 minutes)
    const backlog = games.filter(game => {
      const playtime = game.playtime_forever || 0;
      return playtime < 3000;
    });
    
    if (backlog.length === 0) {
      return {
        success: true,
        recommendations: [],
        message: 'Wow, you have zero games in your backlog! Keep it up!'
      };
    }
    
    // 3. Shuffle and pick up to 12 candidate games to request details for in a single batch
    const shuffled = [...backlog].sort(() => 0.5 - Math.random());
    const candidates = shuffled.slice(0, 12);
    
    // 4. Batch query details from Steam Store API
    const appids = candidates.map(c => c.appid).join(',');
    const storeUrl = `https://store.steampowered.com/api/appdetails?appids=${appids}&filters=genres,categories&l=${lang}`;
    
    const storeResponse: any = await $fetch(storeUrl).catch((err) => {
      console.error('Error fetching batch store details:', err);
      return {};
    });
    
    // 5. Score candidates
    const scoredGames = candidates.map(game => {
      const storeInfo = storeResponse[game.appid.toString()];
      let score = 10; // base score to keep variety
      
      const categories: number[] = [];
      const genres: string[] = [];
      let categoryNames: string[] = [];
      let genreNames: string[] = [];
      
      if (storeInfo?.success && storeInfo?.data) {
        const data = storeInfo.data;
        if (data.categories) {
          data.categories.forEach((c: any) => {
            categories.push(Number(c.id));
            categoryNames.push(c.description);
          });
        }
        if (data.genres) {
          data.genres.forEach((g: any) => {
            genres.push(g.id.toString());
            genreNames.push(g.description);
          });
        }
      }
      
      // Heuristic 1: Filter by mood
      if (mood === 'story') {
        if (categories.includes(2)) score += 8; // Single-player category ID
        if (genres.includes('3')) score += 6;  // RPG genre ID
        if (genres.includes('25')) score += 6; // Adventure ID
        if (genres.includes('1')) score += 3;  // Action ID
        if (categories.includes(1)) score -= 6; // Multi-player ID
        if (genres.includes('4')) score -= 4;  // Casual ID
      } else if (mood === 'casual') {
        if (genres.includes('4')) score += 8;  // Casual ID
        if (genres.includes('18')) score += 6; // Sports ID
        if (genres.includes('9')) score += 6;  // Racing ID
        if (genres.includes('28')) score += 5; // Simulation ID
        if (genres.includes('2')) score += 4;  // Strategy ID
        if (categories.includes(1) || categories.includes(9)) score += 5; // Multiplayer/Coop
        if (genres.includes('3')) score -= 5;  // RPG
      } else if (mood === 'challenge') {
        if (genres.includes('1')) score += 5;  // Action
        if (genres.includes('3')) score += 4;  // RPG
        if (genres.includes('2')) score += 4;  // Strategy
        if (genres.includes('23')) score += 3; // Indie (Soulslike, Roguelikes are often Indie)
      }
      
      // Heuristic 2: Filter by time available
      if (time === '1-2') {
        // Prefer Casual, Puzzle, Sports, Racing, short-session games
        if (genres.includes('4') || genres.includes('18') || genres.includes('9')) score += 6;
        if (genres.includes('3')) score -= 6; // RPGs require more time
      } else if (time === '2-5') {
        // Action, adventure, roguelike, strategy
        if (genres.includes('1') || genres.includes('25') || genres.includes('2')) score += 4;
      } else if (time === '5+') {
        // RPG, simulation, open-world
        if (genres.includes('3') || genres.includes('28')) score += 8;
        if (genres.includes('4')) score -= 5; // Casual games are too short
      }
      
      // Small bonus if game was never played
      if (game.playtime_forever === 0) {
        score += 2;
      }
      
      return {
        ...game,
        score,
        categories: categoryNames,
        genres: genreNames
      };
    });
    
    // Sort candidates by score in descending order
    scoredGames.sort((a, b) => b.score - a.score);
    
    // Take top 3 recommendations
    const recommendations = scoredGames.slice(0, 3).map(rec => {
      let reason = '';
      if (mood === 'story') {
        reason = lang === 'ukrainian' ? 'Цікава сюжетна пригода' : lang === 'russian' ? 'Интересное сюжетное приключение' : 'Captivating story-driven adventure';
      } else if (mood === 'challenge') {
        reason = lang === 'ukrainian' ? 'Справжній виклик для навичок' : lang === 'russian' ? 'Настоящий вызов для навыков' : 'Challenging test of your skills';
      } else {
        reason = lang === 'ukrainian' ? 'Чудова гра для короткої сесії' : lang === 'russian' ? 'Отличная игра для короткой сессии' : 'Great game for a quick session';
      }
      
      return {
        appid: rec.appid,
        name: rec.name,
        playtime_forever: rec.playtime_forever,
        playtime_hours: rec.playtime_hours,
        header_img: rec.header_img,
        genres: rec.genres,
        categories: rec.categories,
        reason
      };
    });
    
    return {
      success: true,
      recommendations
    };
  } catch (error: any) {
    console.error('Error generating recommendations:', error);
    return {
      success: false,
      error: error.message || 'An error occurred while generating recommendations.'
    };
  }
});
