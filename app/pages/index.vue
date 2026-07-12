<template>
  <div>
    <div
      v-if="games.length > 0"
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      <GamesCard v-for="game in games" :key="game.appid" :game="game"></GamesCard>
    </div>

    {{ gamesAsyncData.data }}
  </div>
</template>

<script setup lang="ts">
const gamesAsyncData = await useAsyncData("games", () =>
  apiRepository.loadGames({
    lang: "en",
    apiKey: "",
    steamId: "",
  }),
);

const games = computed(() => gamesAsyncData.data.value?.games || []);

const dialogSettings = useSettingDialog();

onMounted(() => {
  setTimeout(() => {
    dialogSettings.value = true;
  }, 10000);
});
</script>
