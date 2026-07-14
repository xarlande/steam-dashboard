export default function () {
  return useCookie("steam_id", {
    default: () => "",
  });
}
