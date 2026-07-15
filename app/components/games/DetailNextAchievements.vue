<template>
  <section class="animate-fade-in mb-8">
    <UiCard class="border-cyan-500/20 bg-gradient-to-r from-cyan-950/10 to-transparent shadow-xs">
      <UiCardContent class="p-6">
        <div class="mb-4 flex items-center gap-2.5">
          <span class="text-xl">🎯</span>
          <div>
            <h3 class="text-foreground text-base leading-snug font-bold">
              {{ $t("game.nextTitle") }}
            </h3>
            <p class="text-muted-foreground mt-0.5 text-xs">{{ $t("game.nextDesc") }}</p>
          </div>
        </div>

        <!-- List of 3 next targets -->
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div
            v-for="ach in nextAchievements"
            :key="'next-' + ach.apiname"
            class="border-border bg-card/30 flex items-center gap-3.5 rounded-2xl border p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-500/30 hover:shadow-[0_4px_15px_rgba(34,211,238,0.12)] group"
          >
            <!-- Gray Icon, becomes colored on hover -->
            <div
              class="bg-muted border-border/60 relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border transition-all duration-300 group-hover:border-cyan-500/30"
            >
              <!-- Gray icon by default -->
              <img
                :src="ach.icongray"
                :alt="ach.name"
                class="absolute inset-0 h-full w-full object-cover transition-all duration-500 group-hover:opacity-0 group-hover:scale-[1.06]"
                @error="handleIconError"
              />
              <!-- Colored icon shown on hover -->
              <img
                :src="ach.icon"
                :alt="ach.name"
                class="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-[1.06]"
                @error="handleIconError"
              />
            </div>

            <div class="min-w-0 flex-1">
              <h4
                class="text-foreground truncate text-xs font-bold transition-colors group-hover:text-cyan-400"
                :title="ach.name"
              >
                {{ ach.name }}
              </h4>
              <p
                class="text-muted-foreground mt-0.5 line-clamp-1 text-[10px]"
                :title="ach.description"
              >
                {{ ach.description || "No description" }}
              </p>

              <!-- Unlock Rate Badge -->
              <div class="mt-2 flex items-center gap-1">
                <UiBadge
                  class="rounded-md border-cyan-500/20 bg-cyan-500/10 px-1.5 py-0.5 text-[9px] font-black text-cyan-400 hover:bg-cyan-500/10"
                >
                  {{ ach.global_percent }}% {{ $t("game.globalUnlocked") }}
                </UiBadge>
              </div>
            </div>
          </div>
        </div>
      </UiCardContent>
    </UiCard>
  </section>
</template>

<script setup lang="ts">
import { type SteamAchievement } from "~/types";

defineProps<{
  nextAchievements: SteamAchievement[];
}>();

function handleIconError(event: Event) {
  const target = event.target as HTMLImageElement;
  if (target) {
    target.src =
      "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/252490/achievements/default.jpg";
  }
}
</script>
