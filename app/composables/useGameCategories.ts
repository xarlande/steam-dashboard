import { GameTypes, type SteamGame } from "~/types";

export const useGameCategories = () => {
  const manualCategories = useStateManualCategories();

  const SESSION_GAME_KEYWORDS = [
    "counter-strike",
    "cs:go",
    "cs2",
    "dota",
    "league of legends",
    "valorant",
    "apex legends",
    "pubg",
    "fortnite",
    "overwatch",
    "war thunder",
    "world of tanks",
    "world of warships",
    "team fortress",
    "rust",
    "dayz",
    "rainbow six",
    "destiny",
    "warframe",
    "helldivers",
    "gta online",
    "dead by daylight",
    "rocket league",
    "fifa",
    "madden",
    "nba 2k",
    "street fighter",
    "tekken",
    "mortal kombat",
    "brawlhalla",
    "among us",
    "phasmophobia",
    "lethal company",
    "roblox",
    "minecraft",
    "payday",
    "left 4 dead",
    "killing floor",
    "deep rock galactic",
    "hearthstone",
    "magic: the gathering",
    "yu-gi-oh",
    "tft",
    "teamfight tactics",
    "diablo",
    "path of exile",
    "lost ark",
    "world of warcraft",
    "guild wars",
    "final fantasy xiv",
    "lineage",
    "black desert",
    "heartstone",
    "call of duty",
    "battlefield",
    "apex",
    "pubg",
    "deadlock",
    "brawl stars",
    "clash",
  ];

  const isDefaultSessionGame = (name: string): boolean => {
    const lowercaseName = name.toLowerCase();
    return SESSION_GAME_KEYWORDS.some((keyword) => lowercaseName.includes(keyword));
  };

  const getGameCategory = (game: { appid: number; name: string }): GameTypes.Category => {
    const manual = manualCategories.value[game.appid];
    if (manual) {
      return manual;
    }
    return isDefaultSessionGame(game.name) ? GameTypes.Category.Session : GameTypes.Category.Story;
  };

  const toggleGameCategory = (appid: number, games: SteamGame[]) => {
    const game = games.find((g) => g.appid === appid);
    const current =
      manualCategories.value[appid] ||
      (isDefaultSessionGame(game?.name || "") ? GameTypes.Category.Session : GameTypes.Category.Story);
    const next =
      current === GameTypes.Category.Story ? GameTypes.Category.Session : GameTypes.Category.Story;
    manualCategories.value[appid] = next;
  };

  return {
    manualCategories,
    isDefaultSessionGame,
    getGameCategory,
    toggleGameCategory,
  };
};
