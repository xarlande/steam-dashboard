export function mapSteamLocale(rawLang: string): string {
  const lang = rawLang.toLowerCase();
  if (lang === "en" || lang === "english") return "english";
  if (lang === "ru" || lang === "russian") return "russian";
  if (lang === "uk" || lang === "ukrainian") return "ukrainian";
  return "english";
}

export function isUkrainian(lang: string): boolean {
  const l = lang.toLowerCase();
  return l === "uk" || l === "ukrainian";
}

export function isRussian(lang: string): boolean {
  const l = lang.toLowerCase();
  return l === "ru" || l === "russian";
}
