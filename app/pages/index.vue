<template>
  <div class="space-y-6">
    <GamesLibraryActions
      :games="games"
      :is-loading="isLoading"
      @refresh="fetchGames"
      @export="openCopyModal"
    />

    <div
      v-if="games.length > 0"
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      <GamesCard v-for="game in games" :key="game.appid" :game="game"></GamesCard>
    </div>

    <!-- Export Achievements Report Modal -->
    <GamesReportAchievementsDialog v-model:open="showCopyModal" :games="games" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";

const apiKey = useSteamApiKey();
const steamId = useSteamId();
const { locale } = useI18n();

const credentials = computed(() => ({
  apiKey: apiKey.value.trim(),
  steamId: steamId.value.trim(),
}));

const debouncedCredentials = refDebounced(credentials, 1000);

const gamesAsyncData = await useAsyncData(
  "games",
  () => {
    return apiRepository.loadGames({
      lang: locale.value,
      apiKey: debouncedCredentials.value.apiKey,
      steamId: debouncedCredentials.value.steamId,
    });
  },
  { watch: [debouncedCredentials] },
);

const games = computed(() => gamesAsyncData.data.value?.games || []);
const isLoading = computed(() => gamesAsyncData.status.value === "pending");

function fetchGames() {
  gamesAsyncData.refresh();
}

const showCopyModal = ref(false);
function openCopyModal() {
  showCopyModal.value = true;
}
</script>
