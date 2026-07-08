export function getRelativeTime(timestamp: number, lang: string): string {
  const isUa = lang === "uk" || lang === "ukrainian";
  const isRu = lang === "ru" || lang === "russian";

  if (!timestamp || timestamp === 0) {
    if (isUa) return "Ніколи";
    if (isRu) return "Никогда";
    return "Never";
  }
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;

  if (diff < 0 || diff < 60) {
    if (isUa) return "Щойно";
    if (isRu) return "Только что";
    return "Just now";
  }

  const mins = Math.floor(diff / 60);
  if (mins < 60) {
    if (isUa) return `${mins} хв. тому`;
    if (isRu) return `${mins} мин. назад`;
    return `${mins}m ago`;
  }

  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    if (isUa) return `${hours} год. тому`;
    if (isRu) return `${hours} ч. назад`;
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  if (days === 1) {
    if (isUa) return "Вчора";
    if (isRu) return "Вчера";
    return "Yesterday";
  }
  if (days < 30) {
    if (isUa) return `${days} дн. тому`;
    if (isRu) return `${days} дн. назад`;
    return `${days}d ago`;
  }

  const months = Math.floor(days / 30);
  if (months === 1) {
    if (isUa) return "1 місяць тому";
    if (isRu) return "1 месяц назад";
    return "1 month ago";
  }
  if (months < 12) {
    if (isUa) return `${months} міс. тому`;
    if (isRu) return `${months} мес. назад`;
    return `${months} months ago`;
  }

  const years = Math.floor(months / 12);
  if (years === 1) {
    if (isUa) return "1 рік тому";
    if (isRu) return "1 год назад";
    return "1 year ago";
  }
  if (isUa) return `${years} р. тому`;
  if (isRu) return `${years} г. назад`;
  return `${years} years ago`;
}
