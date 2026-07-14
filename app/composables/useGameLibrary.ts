import { refDebounced } from "@vueuse/core";

export function useGameLibrary() {
  const { locale } = useI18n();
  const steamId = useStateSteamId();

  const credentials = computed(() => ({
    steamId: steamId.value.trim(),
  }));

  const debouncedCredentials = refDebounced(credentials, 1000);

  const gamesAsyncData = useAsyncData(
    "games",
    () => {
      return apiRepository.loadGames({
        lang: locale.value,
      });
    },
    { watch: [debouncedCredentials] },
  );

  const games = computed(() => gamesAsyncData.data.value?.games || []);
  const isLoading = computed(() => gamesAsyncData.status.value === "pending");
  const error = computed(
    () => gamesAsyncData.error.value?.message || gamesAsyncData.data.value?.error || "",
  );

  const totalHours = computed(() => gamesAsyncData.data.value?.total_playtime_hours || 0);
  const totalCount = computed(() => gamesAsyncData.data.value?.total_count || 0);
  const loadedFromEnv = computed(() => Boolean(gamesAsyncData.data.value?.usingEnv));

  function fetchGames() {
    gamesAsyncData.refresh();
  }

  return {
    // State
    steamId,
    games,
    totalHours,
    totalCount,
    isLoading,
    error,
    loadedFromEnv,

    // Library
    fetchGames,

    // Suspense helper for SSR/page navigation blocking
    suspense: () => gamesAsyncData,
  };
}

