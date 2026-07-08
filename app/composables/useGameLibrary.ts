import type { SteamGame, SteamApiResponse } from "@/types";

export function useGameLibrary() {
  const { locale } = useI18n();

  // Core state
  const apiKey = ref("");
  const steamId = ref("");
  const games = ref<SteamGame[]>([]);
  const totalHours = ref(0);
  const totalCount = ref(0);
  const isLoading = ref(false);
  const error = ref("");
  const loadedFromEnv = ref(false);

  // ── Helpers ──────────────────────────────────────────

  function loadCredentials() {
    apiKey.value = localStorage.getItem("steam_api_key") || "";
    steamId.value = localStorage.getItem("steam_id") || "";
  }

  const hasSavedCredentials = computed(() => {
    if (import.meta.client) {
      return (
        Boolean(localStorage.getItem("steam_api_key")) && Boolean(localStorage.getItem("steam_id"))
      );
    }
    return false;
  });

  // ── Fetch games ──────────────────────────────────────

  async function fetchGames() {
    isLoading.value = true;
    error.value = "";

    try {
      const params = new URLSearchParams();
      if (apiKey.value.trim()) {
        params.append("apiKey", apiKey.value.trim());
      }
      if (steamId.value.trim()) {
        params.append("steamId", steamId.value.trim());
      }
      params.append("lang", locale.value);

      const response = await $fetch<SteamApiResponse>(`/api/steam/games?${params.toString()}`);

      if (response.success && response.games) {
        games.value = response.games;
        totalHours.value = response.total_playtime_hours || 0;
        totalCount.value = response.total_count || 0;
        loadedFromEnv.value = Boolean(response.usingEnv);

        // Save valid local keys to storage
        if (apiKey.value.trim() && steamId.value.trim()) {
          localStorage.setItem("steam_api_key", apiKey.value.trim());
          localStorage.setItem("steam_id", steamId.value.trim());
        }
        localStorage.setItem("steam_language", locale.value);
      } else {
        error.value = response.error || "Failed to fetch games";
      }
    } catch (error: any) {
      console.error("Error fetching library:", error);
      error.value =
        error.data?.error ||
        error.data?.message ||
        error.message ||
        "An unexpected error occurred.";
    } finally {
      isLoading.value = false;
    }
  }

  // ── Settings helpers ────────────────────────────────

  function saveSettings() {
    error.value = "";
    if (
      !loadedFromEnv.value &&
      !hasSavedCredentials.value &&
      (!apiKey.value.trim() || !steamId.value.trim())
    ) {
      error.value = "Please provide both a Steam API Key and a Steam 64 ID.";
      return false;
    }
    localStorage.setItem("steam_language", locale.value);
    fetchGames();
    return true;
  }

  return {
    // State
    apiKey,
    steamId,
    games,
    totalHours,
    totalCount,
    isLoading,
    error,
    loadedFromEnv,

    // Credentials helpers
    loadCredentials,
    hasSavedCredentials,

    // Library
    fetchGames,

    // Settings
    saveSettings,
  };
}
