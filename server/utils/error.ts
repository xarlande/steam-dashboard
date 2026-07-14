export function sanitizeError(err: any): string {
  const apiKey = process.env.STEAM_API_KEY;
  const msg = err?.message || String(err);
  return apiKey ? msg.replaceAll(apiKey, "REDACTED_API_KEY") : msg;
}
