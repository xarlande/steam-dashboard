import { GameTypes } from "~/types";

export default function () {
  return useCookie<Record<number, GameTypes.Category>>("steam_game_categories", {
    default: () => ({}),
  });
}
