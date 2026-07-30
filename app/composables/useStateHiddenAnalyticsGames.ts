export default function () {
  return useCookie<Record<number, boolean>>("steam_hidden_analytics_games", {
    default: () => ({}),
  });
}
