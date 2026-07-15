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

    <!-- Skeletons (Loading State) -->
    <div
      v-if="isLoading"
      class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    >
      <UiCard v-for="i in 8" :key="i" class="bg-card/45 border-border/50 flex h-full flex-col overflow-hidden py-0 gap-0">
        <UiSkeleton class="aspect-[460/215] w-full" />
        <div class="flex-1 space-y-4 p-4">
          <div class="space-y-2">
            <UiSkeleton class="h-4.5 w-2/3 rounded-md" />
            <UiSkeleton class="h-3 w-1/3 rounded-md" />
          </div>
          <div class="border-border/60 border-t pt-3 flex items-center justify-between">
            <div class="space-y-1.5">
              <UiSkeleton class="h-2.5 w-12 rounded-md" />
              <UiSkeleton class="h-3.5 w-16 rounded-md" />
            </div>
          </div>
        </div>
      </UiCard>
    </div>

    <!-- Games Grid (Loaded State) -->
    <div
      v-else-if="filteredAndSortedGames.length > 0"
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
import { toast } from "vue-sonner";

import { GameTypes, type SteamGame } from "@/types";

const { games, isLoading, error, suspense, fetchGames } = useGameLibrary();
await suspense();

const steamId = useStateSteamId();
const showSettings = useStateSettingsDialogOpen();

onMounted(() => {
  if (!steamId.value.trim()) {
    showSettings.value = true;
  }
});

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
