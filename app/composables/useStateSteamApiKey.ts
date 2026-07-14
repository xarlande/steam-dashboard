export default function () {
  return useCookie("steam_api_key", {
    default: () => "",
  });
}
