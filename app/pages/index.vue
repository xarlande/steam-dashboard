<template>
  <div>
    <!-- Refresh Button -->
    <UiButton
      v-if="games.length > 0"
      variant="outline"
      size="icon"
      @click="fetchGames"
      :disabled="isLoading"
      class="group"
      title="Refresh library"
    >
      <RotateCwIcon
        class="w-5 h-5 transition-transform duration-75 group-hover:rotate-180"
        :class="{ 'animate-spin': isLoading }"
      />
    </UiButton>

    <!-- Analytics Button -->
    <UiButton v-if="games.length > 0" variant="outline" as-child>
      <NuxtLinkLocale to="/analytics" class="flex items-center gap-2">
        <BarChart2Icon class="w-4 h-4 text-violet-400" />
        <span>{{ $t("index.analyticsBtn") }}</span>
      </NuxtLinkLocale>
    </UiButton>

    <!-- Copy Report Button -->
    <UiButton
      v-if="games.length > 0"
      variant="outline"
      @click="openCopyModal"
      class="flex items-center gap-2"
    >
      <CopyIcon class="w-4 h-4 text-cyan-400" />
      <span>{{ $t("exportReport.btn") }}</span>
    </UiButton>

    <div
      v-if="games.length > 0"
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      <GamesCard v-for="game in games" :key="game.appid" :game="game"></GamesCard>
    </div>
  </div>
</template>

<script setup lang="ts">
const apiKey = useSteamApiKey();
const steamId = useSteamId();

const credentials = computed(() => ({
  apiKey: apiKey.value.trim(),
  steamId: steamId.value.trim(),
}));

const debouncedCredentials = refDebounced(credentials, 1000);

const gamesAsyncData = await useAsyncData(
  "games",
  () => {
    return apiRepository.loadGames({
      lang: "en",
      apiKey: debouncedCredentials.value.apiKey,
      steamId: debouncedCredentials.value.steamId,
    });
  },
  { watch: [debouncedCredentials] },
);

const games = computed(() => gamesAsyncData.data.value?.games || []);
</script>
