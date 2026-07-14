import type { GamesReportAchievementsTypes } from "~/types";

// Format numbers nicely (e.g. 1,234.5)
function formatHours(hours: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(hours);
}

function formatCompletedGames(
  completed: GamesReportAchievementsTypes.GameReportAchievements[],
  t: GamesReportAchievementsTypes.TranslationFn,
  includeAchievements: boolean,
): string {
  let text = `==========================================\n`;
  text += `${t("exportReport.completedSection")} [${completed.length}]\n`;
  text += `==========================================\n`;
  if (completed.length === 0) {
    text += `${t("exportReport.none")}\n`;
  } else {
    completed.forEach((r, idx) => {
      text += `${idx + 1}. ${r.game.name}\n`;
      text += `   - ${t("exportReport.playtime", { hours: formatHours(r.game.playtime_hours) })}\n`;
      text += `   - ${t("exportReport.achievementsProgress", { unlocked: r.unlockedCount, total: r.totalCount, percent: 100 })}\n`;
      if (includeAchievements && r.achievements.length > 0) {
        text += `   - ${t("exportReport.unlockedAchievementsTitle")}\n`;
        r.achievements.forEach((ach) => {
          text += `     * [✓] ${ach.name} - ${ach.description || ""}\n`;
        });
      }
      text += `\n`;
    });
  }
  return text;
}

function formatUncompletedGames(
  uncompleted: GamesReportAchievementsTypes.GameReportAchievements[],
  t: GamesReportAchievementsTypes.TranslationFn,
  includeAchievements: boolean,
): string {
  let text = `==========================================\n`;
  text += `${t("exportReport.uncompletedSection")} [${uncompleted.length}]\n`;
  text += `==========================================\n`;
  if (uncompleted.length === 0) {
    text += `${t("exportReport.none")}\n`;
  } else {
    uncompleted.forEach((r, idx) => {
      text += `${idx + 1}. ${r.game.name}\n`;
      text += `   - ${t("exportReport.playtime", { hours: formatHours(r.game.playtime_hours) })}\n`;
      text += `   - ${t("exportReport.achievementsProgress", { unlocked: r.unlockedCount, total: r.totalCount, percent: r.unlockedPercent })}\n`;

      if (includeAchievements) {
        // Locked achievements list (always include all)
        const locked = r.achievements.filter((ach) => !ach.achieved);
        if (locked.length > 0) {
          text += `   - ${t("exportReport.lockedAchievementsTitle")} (${locked.length}):\n`;
          locked.forEach((ach) => {
            text += `     * [ ] ${ach.name} - ${ach.description || ""}\n`;
          });
        }

        // Unlocked achievements list (always include all)
        const unlocked = r.achievements.filter((ach) => ach.achieved);
        if (unlocked.length > 0) {
          text += `   - ${t("exportReport.unlockedAchievementsTitle")}:\n`;
          unlocked.forEach((ach) => {
            text += `     * [✓] ${ach.name} - ${ach.description || ""}\n`;
          });
        }
      }
      text += `\n`;
    });
  }
  return text;
}

function formatNoAchievementsGames(
  noAchievements: GamesReportAchievementsTypes.GameReportAchievements[],
  t: GamesReportAchievementsTypes.TranslationFn,
): string {
  let text = `==========================================\n`;
  text += `${t("exportReport.noAchievementsSection")} [${noAchievements.length}]\n`;
  text += `==========================================\n`;
  if (noAchievements.length === 0) {
    text += `${t("exportReport.none")}\n`;
  } else {
    noAchievements.forEach((r, idx) => {
      text += `${idx + 1}. ${r.game.name} (${formatHours(r.game.playtime_hours)} ${t("common.hoursSuffix")})\n`;
    });
  }
  return text;
}

export function reportGameAchievementFormatReport({
  results,
  totalCount,
  totalHours,
  t,
  includeAchievements = true,
}: GamesReportAchievementsTypes.GameReportAchievementsParams): string {
  const sortedResults = [...results].sort(
    (a, b) => b.game.playtime_forever - a.game.playtime_forever,
  );

  const completed = sortedResults.filter(
    (r) => r.hasAchievements && r.unlockedCount === r.totalCount,
  );
  const uncompleted = sortedResults.filter(
    (r) => r.hasAchievements && r.unlockedCount < r.totalCount,
  );
  const noAchievements = sortedResults.filter((r) => !r.hasAchievements);

  let text = `🏆 Steam Library Report 🏆\n`;
  text += `Generated: ${new Date().toLocaleString()}\n`;
  text += `${t("exportReport.totalGames", { count: totalCount })}\n`;
  text += `Total Playtime: ${formatHours(totalHours)} ${t("common.hoursSuffix")}\n\n`;

  text += formatCompletedGames(completed, t, includeAchievements);
  text += formatUncompletedGames(uncompleted, t, includeAchievements);
  text += formatNoAchievementsGames(noAchievements, t);

  return text;
}
