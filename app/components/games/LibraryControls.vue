<template>
  <div
    class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/45 p-4 rounded-2xl border border-border/50"
  >
    <!-- Search input -->
    <div class="relative flex-1 max-w-md">
      <span
        class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground z-10"
      >
        <SearchIcon class="w-4 h-4" />
      </span>
      <UiInput
        type="text"
        v-model="searchQuery"
        :placeholder="$t('index.searchPlaceholder')"
        class="w-full pl-9 pr-8"
      />
      <UiButton
        v-if="searchQuery"
        variant="ghost"
        size="icon"
        @click="searchQuery = ''"
        class="absolute right-0 top-0 bottom-0"
      >
        <XIcon class="w-4 h-4" />
      </UiButton>
    </div>

    <!-- Sorting Tabs -->
    <div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 shrink-0">
      <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-2 shrink-0">
        {{ $t("index.sortBy") }}
      </span>
      <UiTabs v-model="sortBy" class="w-auto">
        <UiTabsList>
          <UiTabsTrigger :value="GameTypes.SortKey.LastPlayed">
            {{ $t("index.sortOptions.lastPlayed") }}
          </UiTabsTrigger>
          <UiTabsTrigger :value="GameTypes.SortKey.PlaytimeDesc">
            {{ $t("index.sortOptions.playtimeDesc") }}
          </UiTabsTrigger>
          <UiTabsTrigger :value="GameTypes.SortKey.PlaytimeAsc">
            {{ $t("index.sortOptions.playtimeAsc") }}
          </UiTabsTrigger>
          <UiTabsTrigger :value="GameTypes.SortKey.Name">
            {{ $t("index.sortOptions.name") }}
          </UiTabsTrigger>
        </UiTabsList>
      </UiTabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SearchIcon, XIcon } from "@lucide/vue";
import { GameTypes } from "@/types";

const searchQuery = defineModel<string>("searchQuery", { required: true });
const sortBy = defineModel<GameTypes.SortKey>("sortBy", { required: true });
</script>
