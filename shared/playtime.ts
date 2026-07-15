export function convertMinutesToHours(minutes: number): number {
  return Math.round((minutes / 60) * 10) / 10;
}
