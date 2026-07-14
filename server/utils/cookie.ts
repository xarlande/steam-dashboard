export function parseCookieValue(val: any): string {
  if (!val) return "";
  try {
    return String(JSON.parse(String(val)));
  } catch {
    return String(val);
  }
}
