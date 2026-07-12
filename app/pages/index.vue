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
import { ClockIcon, PlayIcon, StarIcon } from "@lucide/vue";

const gamesAsyncData = await useAsyncData("games", () =>
  apiRepository.loadGames({
    lang: "en",
    apiKey: "",
    steamId: "",
  }),
);

const games = computed(() => gamesAsyncData.data.value?.games || []);
</script>
