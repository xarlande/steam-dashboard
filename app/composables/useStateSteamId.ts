export default function () {
  return useCookie<string>("steam_id", {
    default: () => "",
    encode: (val) => val,
    decode: (val) => val ?? "",
  });
}
