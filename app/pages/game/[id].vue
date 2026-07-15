<template>
  <div>
    <!-- Loading State (Hero Details) -->
    <section v-if="isLoading" class="mb-8">
    <UiCard class="animate-pulse border border-neutral-800/60 bg-neutral-900 p-6 sm:p-8">
      <div class="flex flex-col items-center gap-6 md:flex-row">
        <UiSkeleton class="aspect-[460/215] w-full rounded-xl md:w-[220px]" />
        <div class="w-full flex-1 space-y-4">
          <UiSkeleton class="h-8 w-1/2 rounded-md" />
          <UiSkeleton class="h-4 w-1/4 rounded-md" />
          <UiSkeleton class="h-4 w-3/4 rounded-md pt-4" />
        </div>
      </div>
    </UiCard>
  </section>

  <!-- Loaded State: Hero Game Info -->
  <section v-else-if="!error" class="animate-fade-in mb-8">
    <UiCard>
      <UiCardContent class="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <!-- Banner & Name -->
        <div class="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
          <div
            class="border-neutral-850 relative aspect-[460/215] w-[220px] shrink-0 overflow-hidden rounded-xl border shadow-md"
          >
            <img
              :src="headerImgUrl"
              :alt="gameName"
              class="h-full w-full object-cover"
              @error="handleImageError"
            />
          </div>

          <div class="space-y-2">
            <UiBadge variant="secondary"> App ID: {{ appid }} </UiBadge>
            <h2
              class="text-foreground text-2xl leading-tight font-extrabold tracking-tight sm:text-3xl"
            >
              {{ gameName }}
            </h2>
            <div
              class="text-muted-foreground flex flex-wrap items-center justify-center gap-4 pt-1 text-sm font-medium sm:justify-start"
            >
              <div class="flex items-center gap-1.5">
                <ClockIcon class="text-muted-foreground h-4 w-4" />
                <span
                  >{{ $t("game.completionProgress") }}:
                  <span class="text-foreground font-semibold">{{ unlockedCount }}</span> /
                  <span class="text-foreground font-semibold">{{ totalCount }}</span></span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Achievements Progress (shadcn Progress) -->
        <div
          class="bg-muted/40 border-border flex min-w-[150px] shrink-0 flex-col items-center justify-center rounded-xl border p-4"
        >
          <span class="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">{{
            $t("game.unlockedLabel")
          }}</span>
          <span
            class="mt-1 bg-gradient-to-br from-cyan-400 to-indigo-400 bg-clip-text text-3xl font-black tracking-tight text-transparent"
          >
            {{ unlockedPercent }}%
          </span>
          <UiProgress :model-value="unlockedPercent" class="mt-3 w-full" />
        </div>
      </UiCardContent>
    </UiCard>
  </section>

  <!-- Easy Targets / The Next Achievements -->
  <GamesDetailNextAchievements
    v-if="!isLoading && !error && nextAchievements.length > 0"
    :next-achievements="nextAchievements"
  />

  <!-- If 100% Completed, show congratulations -->
  <section
    v-else-if="!isLoading && !error && achievements.length > 0 && nextAchievements.length === 0"
    class="animate-fade-in mb-8"
  >
    <UiCard
      class="border-emerald-500/20 bg-gradient-to-r from-emerald-950/10 to-transparent shadow-xs"
    >
      <UiCardContent class="flex items-center gap-4 p-6">
        <span class="text-3xl select-none">🏆</span>
        <div>
          <h3 class="text-base leading-snug font-extrabold text-emerald-400">
            {{ $t("game.congratsTitle") }}
          </h3>
          <p class="text-muted-foreground mt-0.5 text-xs font-medium">
            {{ $t("game.congratsDesc") }}
          </p>
        </div>
      </UiCardContent>
    </UiCard>
  </section>

  <!-- Main Content Block -->
  <section v-if="!isLoading && !error" class="animate-fade-in space-y-6">
    <!-- Filter Controls (Search + Tabs) -->
    <div
      class="bg-card border-border flex flex-col justify-between gap-4 rounded-2xl border p-4 md:flex-row md:items-center"
    >
      <!-- Search in Achievements -->
      <div class="relative max-w-md flex-1">
        <span
          class="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3"
        >
          <SearchIcon class="h-4.5 w-4.5" />
        </span>
        <UiInput
          type="text"
          v-model="searchQuery"
          :placeholder="$t('game.searchPlaceholder')"
          class="w-full pr-8 pl-9"
        />
        <UiButton
          v-if="searchQuery"
          variant="ghost"
          size="icon"
          @click="searchQuery = ''"
          class="absolute top-0 right-0 bottom-0"
        >
          <XIcon class="h-4 w-4" />
        </UiButton>
      </div>

      <!-- Tabs: All, Unlocked, Locked (shadcn tabs) -->
      <div class="no-scrollbar flex items-center gap-2 overflow-x-auto py-0.5">
        <span
          class="text-muted-foreground mr-2 shrink-0 text-xs font-semibold tracking-wider uppercase"
          >{{ $t("game.filterLabel") }}</span
        >
        <UiTabs v-model="filterBy" class="w-auto">
          <UiTabsList>
            <UiTabsTrigger :value="GameTypes.AchievementFilter.All"
              >{{ $t("game.filterAll") }} ({{ totalCount }})</UiTabsTrigger
            >
            <UiTabsTrigger :value="GameTypes.AchievementFilter.Unlocked"
              >{{ $t("game.filterUnlocked") }} ({{ unlockedCount }})</UiTabsTrigger
            >
            <UiTabsTrigger :value="GameTypes.AchievementFilter.Locked"
              >{{ $t("game.filterLocked") }} ({{ totalCount - unlockedCount }})</UiTabsTrigger
            >
          </UiTabsList>
        </UiTabs>
      </div>
    </div>

    <!-- Skeleton Grid while loading -->
    <div v-if="isLoading" class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <UiCard v-for="i in 6" :key="i" class="flex items-center gap-4 p-4">
        <UiSkeleton class="h-14 w-14 shrink-0 rounded-xl" />
        <div class="flex-1 space-y-2">
          <UiSkeleton class="h-4.5 w-1/3 rounded-md" />
          <UiSkeleton class="h-3 w-3/4 rounded-md" />
        </div>
      </UiCard>
    </div>

    <!-- Achievements Grid -->
    <div v-else-if="filteredAchievements.length > 0" class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <GamesAchievementCard
        v-for="ach in filteredAchievements"
        :key="ach.apiname"
        :achievement="ach"
      />
    </div>

    <!-- Empty Grid/Search -->
    <UiCard v-else class="mx-auto max-w-md text-center">
      <UiCardContent>
        <div
          class="bg-card border-border text-muted-foreground mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border"
        >
          <AlertCircleIcon class="h-8 w-8" />
        </div>
        <h3 class="text-base font-bold">{{ $t("game.noAchievements") }}</h3>
        <p class="text-muted-foreground mx-auto mt-1 max-w-xs text-xs">
          {{ $t("game.noAchievementsDesc") }}
        </p>
      </UiCardContent>
    </UiCard>
  </section>

  <!-- Global Error Alert / Back Action -->
  <section v-if="error" class="mx-auto max-w-2xl py-8">
    <div
      class="bg-destructive/10 border-destructive/20 text-destructive-foreground flex items-start gap-4 rounded-lg border p-6 text-sm shadow-lg"
    >
      <AlertCircleIcon class="text-destructive mt-0.5 h-6 w-6 shrink-0" />
      <div class="flex-1">
        <h3 class="text-destructive mb-1 text-base font-extrabold">
          {{ $t("game.failedLoad") }}
        </h3>
        <p class="leading-relaxed">{{ error }}</p>
        <div class="mt-4 flex items-center gap-3">
          <UiButton variant="outline" as-child>
            <NuxtLink to="/"> &larr; {{ $t("game.returnBtn") }} </NuxtLink>
          </UiButton>
          <UiButton variant="outline" @click="refreshAchievements">
            {{ $t("game.retryBtn") }}
          </UiButton>
        </div>
      </div>
    </div>
  </section>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import { refDebounced } from "@vueuse/core";
import { GameTypes } from "@/types";
import {
  ClockIcon,
  SearchIcon,
  XIcon,
  AlertCircleIcon,
} from "@lucide/vue";

definePageMeta({
  showBackButton: true,
});

const route = useRoute();
const appid = route.params.id as string;
const { locale } = useI18n();

const steamId = useStateSteamId();

const credentials = computed(() => ({
  steamId: steamId.value.trim(),
}));

const debouncedCredentials = refDebounced(credentials, 1000);

const achievementsAsyncData = await useAsyncData(
  `achievements-${appid}`,
  () => apiRepository.loadAchievements({ appid, lang: locale.value }),
  { watch: [debouncedCredentials] },
);

// Game stats computed from async data
const gameName = computed(() => achievementsAsyncData.data.value?.gameName || "Steam Game");
const achievements = computed(() => achievementsAsyncData.data.value?.achievements || []);
const totalCount = computed(() => achievementsAsyncData.data.value?.total_count || 0);
const unlockedCount = computed(() => achievementsAsyncData.data.value?.unlocked_count || 0);
const unlockedPercent = computed(() => achievementsAsyncData.data.value?.unlocked_percent || 0);

// System states
const isLoading = computed(() => achievementsAsyncData.status.value === "pending");
const error = computed(() => {
  if (achievementsAsyncData.error.value) {
    return achievementsAsyncData.error.value.message || "An unexpected error occurred.";
  }
  if (achievementsAsyncData.data.value?.success === false) {
    return achievementsAsyncData.data.value?.error || "Failed to retrieve achievements.";
  }
  if (totalCount.value === 0 && achievementsAsyncData.data.value?.success) {
    return "This game does not support Steam achievements or stats.";
  }
  return "";
});

const searchQuery = ref("");
const filterBy = ref<GameTypes.AchievementFilter>(GameTypes.AchievementFilter.All);

// Next locked achievements sorted by global unlock percentage
const nextAchievements = computed(() => {
  const locked = achievements.value.filter((a) => !a.achieved);
  // Sort by global_percent descending
  locked.sort((a, b) => (b.global_percent || 0) - (a.global_percent || 0));
  return locked.slice(0, 3);
});

// Compute standard Game capsule header
const headerImgUrl = computed(() => {
  return `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appid}/header.jpg`;
});

function refreshAchievements() {
  achievementsAsyncData.refresh();
}

function handleImageError(event: Event) {
  const target = event.target as HTMLImageElement;
  if (target) {
    target.src =
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=460&h=215";
  }
}

const filteredAchievements = computed(() => {
  let list = [...achievements.value];

  // Filter by achievement type
  if (filterBy.value === GameTypes.AchievementFilter.Unlocked) {
    list = list.filter((a) => a.achieved);
  } else if (filterBy.value === GameTypes.AchievementFilter.Locked) {
    list = list.filter((a) => !a.achieved);
  }

  // Search query filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(
      (a) => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q),
    );
  }

  return list;
});
</script>

<style scoped>
/* Custom scrollbar reset */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
