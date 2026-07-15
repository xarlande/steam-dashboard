import { ref, watch, type Ref } from "vue";
import { useI18n } from "vue-i18n";
import { toast } from "vue-sonner";

export function useSettings(isOpen: Ref<boolean | undefined>) {
  const { t, locale } = useI18n();

  // Cookie instances
  const cookieSteamId = useStateSteamId();

  // Local form states
  const localSteamId = ref("");

  // Initialize on open
  watch(
    isOpen,
    (newVal) => {
      if (newVal) {
        localSteamId.value = cookieSteamId.value || "";
      }
    },
    { immediate: true },
  );

  function saveSettings() {
    cookieSteamId.value = localSteamId.value.trim();
    toast.success(t("common.savedSuccessfully"));
  }

  function clearSettings() {
    localSteamId.value = "";
    cookieSteamId.value = "";
    toast.success(t("common.resetSuccessfully"));
  }

  function exportSettings() {
    const currentSteamId = localSteamId.value.trim() || cookieSteamId.value || "";

    const settings = {
      exportedAt: new Date().toISOString(),
      steam_game_categories: useStateManualCategories().value,
      steam_id: currentSteamId,
      steam_language: locale.value,
      version: 1,
    };

    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `steam-dashboard-settings-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("index.credentials.exportSuccess"));
  }

  function importSettingsFile(file: File) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const raw = e.target?.result as string;
        const data = JSON.parse(raw);

        if (typeof data !== "object" || data === null) {
          throw new Error("Not an object");
        }

        if (data.steam_id !== undefined) {
          const val = String(data.steam_id);
          cookieSteamId.value = val;
          localSteamId.value = val;
        }

        toast.success(t("index.credentials.importSuccess"));
      } catch {
        toast.error(t("index.credentials.importError"));
      }
    };
    reader.onerror = () => toast.error(t("index.credentials.importFileError"));
    reader.readAsText(file);
  }

  return {
    localSteamId,
    saveSettings,
    clearSettings,
    exportSettings,
    importSettingsFile,
  };
}
