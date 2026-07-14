import { useLocalStorage } from "@vueuse/core";
import { GameTypes } from "~/types";

export default function () {
  return useLocalStorage<Record<number, GameTypes.Category>>("steam_game_categories", {});
}
