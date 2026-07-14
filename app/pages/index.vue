<template>
  <div class="space-y-6">
    <GamesLibraryActions
      :games="games"
      :is-loading="isLoading"
      @refresh="fetchGames"
      @export="openCopyModal"
    />

    <!-- Global Library Stats -->
    <GamesLibraryStats :games="games" />

    <!-- Gaming Time Quality (Detox) -->
    <GamesLibraryDetox :games="games" />

    <!-- Search and Sort Controls -->
    <GamesLibraryControls
      v-if="games.length > 0"
      v-model:searchQuery="searchQuery"
      v-model:sortBy="sortBy"
    />

    <!-- Games Grid (Loaded State) -->
    <div
      v-if="filteredAndSortedGames.length > 0"
      class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    >
      <GamesCard v-for="game in filteredAndSortedGames" :key="game.appid" :game="game"></GamesCard>
    </div>

    <!-- Empty Search Results State -->
    <GamesLibraryEmptySearch
      v-else-if="games.length > 0 && filteredAndSortedGames.length === 0"
      @clear="searchQuery = ''"
    />

    <!-- Export Achievements Report Modal -->
    <GamesReportAchievementsDialog v-model:open="showCopyModal" :games="games" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { toast } from "vue-sonner";

import { GameTypes, type SteamGame } from "@/types";

const { games, isLoading, error, suspense, fetchGames } = useGameLibrary();
await suspense();

// Watch for errors to display using Sonner toast
watch(
  error,
  (newError) => {
    if (newError) {
      toast.error(newError);
    }
  },
  { immediate: true },
);

// Filtering & Sorting
const searchQuery = ref("");
const sortBy = ref<GameTypes.SortKey>(GameTypes.SortKey.LastPlayed);

const filteredAndSortedGames = computed(() => {
  let list = [...games.value];

  // Apply search query
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter((game) => game.name.toLowerCase().includes(q));
  }

  // Apply sorting rules
  const comparator = sortComparators[sortBy.value];
  if (comparator) {
    list.sort(comparator);
  }

  return list;
});

const showCopyModal = ref(false);
function openCopyModal() {
  showCopyModal.value = true;
}
</script>
