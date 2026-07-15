interface RelativeTimeLocale {
  never: string;
  justNow: string;
  minsAgo: (mins: number) => string;
  hoursAgo: (hours: number) => string;
  yesterday: string;
  daysAgo: (days: number) => string;
  oneMonthAgo: string;
  monthsAgo: (months: number) => string;
  oneYearAgo: string;
  yearsAgo: (years: number) => string;
}

const locales: Record<"uk" | "ru" | "en", RelativeTimeLocale> = {
  uk: {
    never: "Ніколи",
    justNow: "Щойно",
    minsAgo: (mins) => `${mins} хв. тому`,
    hoursAgo: (hours) => `${hours} год. тому`,
    yesterday: "Вчора",
    daysAgo: (days) => `${days} дн. тому`,
    oneMonthAgo: "1 місяць тому",
    monthsAgo: (months) => `${months} міс. тому`,
    oneYearAgo: "1 рік тому",
    yearsAgo: (years) => `${years} р. тому`,
  },
  ru: {
    never: "Никогда",
    justNow: "Только что",
    minsAgo: (mins) => `${mins} мин. назад`,
    hoursAgo: (hours) => `${hours} ч. назад`,
    yesterday: "Вчера",
    daysAgo: (days) => `${days} дн. назад`,
    oneMonthAgo: "1 месяц назад",
    monthsAgo: (months) => `${months} мес. назад`,
    oneYearAgo: "1 год назад",
    yearsAgo: (years) => `${years} г. назад`,
  },
  en: {
    never: "Never",
    justNow: "Just now",
    minsAgo: (mins) => `${mins}m ago`,
    hoursAgo: (hours) => `${hours}h ago`,
    yesterday: "Yesterday",
    daysAgo: (days) => `${days}d ago`,
    oneMonthAgo: "1 month ago",
    monthsAgo: (months) => `${months} months ago`,
    oneYearAgo: "1 year ago",
    yearsAgo: (years) => `${years} years ago`,
  },
};

export function getRelativeTime(timestamp: number, lang: string): string {
  const l = lang.toLowerCase();
  const localeKey: "uk" | "ru" | "en" = l.startsWith("uk") ? "uk" : l.startsWith("ru") ? "ru" : "en";
  const loc = locales[localeKey];

  if (!timestamp || timestamp === 0) {
    return loc.never;
  }
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;

  if (diff < 0 || diff < 60) {
    return loc.justNow;
  }

  const mins = Math.floor(diff / 60);
  if (mins < 60) {
    return loc.minsAgo(mins);
  }

  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    return loc.hoursAgo(hours);
  }

  const days = Math.floor(hours / 24);
  if (days === 1) {
    return loc.yesterday;
  }
  if (days < 30) {
    return loc.daysAgo(days);
  }

  const months = Math.floor(days / 30);
  if (months === 1) {
    return loc.oneMonthAgo;
  }
  if (months < 12) {
    return loc.monthsAgo(months);
  }

  const years = Math.floor(months / 12);
  if (years === 1) {
    return loc.oneYearAgo;
  }
  return loc.yearsAgo(years);
}
