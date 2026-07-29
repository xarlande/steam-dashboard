import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { toast } from "vue-sonner";

export function useAnalyticsExclusions() {
  const hiddenGames = useStateHiddenAnalyticsGames();
  const { t } = useI18n();

  const isGameHidden = (appid: number): boolean => {
    return !!hiddenGames.value[appid];
  };

  const toggleGameHidden = (appid: number, name?: string) => {
    const currentlyHidden = !!hiddenGames.value[appid];
    const updated = { ...hiddenGames.value };
    if (currentlyHidden) {
      delete updated[appid];
      hiddenGames.value = updated;
      toast.success(t("analytics.shownToast", { name: name || "Game" }));
    } else {
      updated[appid] = true;
      hiddenGames.value = updated;
      toast.success(t("analytics.hiddenToast", { name: name || "Game" }));
    }
  };

  const hiddenCount = computed(() => {
    return Object.values(hiddenGames.value).filter(Boolean).length;
  });

  return {
    hiddenGames,
    isGameHidden,
    toggleGameHidden,
    hiddenCount,
  };
}
