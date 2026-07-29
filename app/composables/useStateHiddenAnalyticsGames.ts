import { useLocalStorage } from "@vueuse/core";

export default function () {
  return useLocalStorage<Record<number, boolean>>("steam_hidden_analytics_games", {});
}
