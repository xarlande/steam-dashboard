<template>
  <div
    class="bg-card/45 border-border/50 flex flex-col justify-between gap-4 rounded-2xl border p-4 backdrop-blur-xs md:flex-row md:items-center"
  >
    <!-- Search input -->
    <div class="relative max-w-md flex-1">
      <UiInput
        type="text"
        v-model="searchQuery"
        :placeholder="$t('index.searchPlaceholder')"
        class="peer w-full pr-8 pl-9 transition-all duration-300 focus-visible:ring-cyan-500/50"
      />
      <span
        class="text-muted-foreground absolute inset-y-0 left-0 z-10 flex items-center pl-3 transition-colors duration-300 peer-focus:text-cyan-400"
      >
        <SearchIcon class="h-4 w-4" />
      </span>
      <UiButton
        v-if="searchQuery"
        variant="ghost"
        size="icon"
        @click="searchQuery = ''"
        class="text-muted-foreground absolute top-0 right-0 bottom-0 transition-colors hover:text-cyan-400"
      >
        <XIcon class="h-4 w-4" />
      </UiButton>
    </div>

    <!-- Sorting Tabs -->
    <div class="no-scrollbar flex shrink-0 items-center gap-2 overflow-x-auto py-0.5">
      <span
        class="text-muted-foreground mr-2 shrink-0 text-xs font-semibold tracking-wider uppercase"
      >
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
