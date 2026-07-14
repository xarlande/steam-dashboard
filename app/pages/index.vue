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
import { ref } from "vue";

const { games, isLoading, suspense, fetchGames } = useGameLibrary();
await suspense();

const showCopyModal = ref(false);
function openCopyModal() {
  showCopyModal.value = true;
}
</script>
