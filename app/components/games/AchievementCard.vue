<template>
  <UiCard
    class="group ach-card flex gap-4 p-4 transition-all duration-300 hover:-translate-y-0.5"
    :class="
      achievement.achieved
        ? 'hover:border-cyan-500/30 hover:shadow-[0_4px_15px_rgba(34,211,238,0.15)] dark:hover:shadow-[0_4px_20px_rgba(34,211,238,0.1)]'
        : 'opacity-65 hover:border-neutral-500/30 hover:opacity-100 hover:shadow-[0_4px_15px_rgba(255,255,255,0.06)] dark:hover:shadow-[0_4px_20px_rgba(255,255,255,0.04)]'
    "
  >
    <!-- Icon -->
    <div
      class="bg-muted border-border relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border transition-all duration-300"
      :class="
        achievement.achieved
          ? 'group-hover:border-cyan-500/30'
          : 'group-hover:border-neutral-500/30'
      "
    >
      <template v-if="achievement.achieved">
        <img
          :src="achievement.icon"
          :alt="achievement.name"
          loading="lazy"
          class="ach-card-img h-full w-full object-cover group-hover:scale-[1.06]"
          @error="handleIconError"
        />
      </template>
      <template v-else>
        <!-- Grayscale icon by default -->
        <img
          :src="achievement.icongray"
          :alt="achievement.name"
          loading="lazy"
          class="ach-card-img absolute inset-0 h-full w-full object-cover transition-all duration-500 group-hover:scale-[1.06] group-hover:opacity-0"
          @error="handleIconError"
        />
        <!-- Colored icon on hover -->
        <img
          :src="achievement.icon"
          :alt="achievement.name"
          loading="lazy"
          class="ach-card-img absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-500 group-hover:scale-[1.06] group-hover:opacity-100"
          @error="handleIconError"
        />
      </template>
    </div>

    <!-- Text details -->
    <div class="flex min-w-0 flex-1 flex-col justify-center pr-2">
      <div class="flex items-start justify-between gap-2">
        <h4
          class="truncate text-sm font-bold transition-colors group-hover:text-cyan-500 sm:text-base dark:group-hover:text-cyan-300"
        >
          {{ achievement.name }}
        </h4>

        <!-- Unlocked Badge (shadcn badge) -->
        <UiBadge v-if="achievement.achieved">
          {{ $t("game.unlockedLabel") }}
        </UiBadge>
      </div>

      <!-- Description -->
      <p class="text-muted-foreground mt-1 line-clamp-2 pr-4 text-xs leading-normal">
        {{ achievement.description || "No description provided." }}
      </p>

      <!-- Unlock relative time -->
      <p
        v-if="achievement.achieved"
        class="text-muted-foreground mt-1.5 flex items-center gap-1 text-[10px] font-medium"
      >
        <CheckIcon class="text-muted-foreground/80 h-3 w-3" />
        <span>{{ $t("game.unlockedAt", { time: achievement.unlocktime_relative }) }}</span>
      </p>
    </div>
  </UiCard>
</template>

<script setup lang="ts">
import { CheckIcon } from "@lucide/vue";
import { type SteamAchievement } from "~/types";

defineProps<{
  achievement: SteamAchievement;
}>();

function handleIconError(event: Event) {
  const target = event.target as HTMLImageElement;
  if (target) {
    target.src =
      "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/252490/achievements/default.jpg";
  }
}
</script>

<style scoped>
.ach-card {
  transition:
    transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
    border-color 0.25s ease,
    box-shadow 0.25s ease,
    opacity 0.25s ease;
}

.ach-card-img {
  transition:
    transform 0.5s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
