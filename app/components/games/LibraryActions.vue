<template>
  <div class="flex items-center gap-3">
    <!-- Refresh Button -->
    <UiButton
      v-if="games.length > 0"
      variant="outline"
      size="icon"
      @click="$emit('refresh')"
      :disabled="isLoading"
      class="group"
      title="Refresh library"
    >
      <RotateCwIcon
        class="h-5 w-5 transition-transform duration-75 group-hover:rotate-180"
        :class="{ 'animate-spin': isLoading }"
      />
    </UiButton>

    <!-- Analytics Button -->
    <UiButton v-if="games.length > 0" variant="outline" as-child>
      <NuxtLinkLocale to="/analytics" class="flex items-center gap-2">
        <BarChart2Icon class="h-4 w-4 text-violet-600 dark:text-violet-400" />
        <span>{{ $t("index.analyticsBtn") }}</span>
      </NuxtLinkLocale>
    </UiButton>

    <!-- Copy Report Button -->
    <UiButton
      v-if="games.length > 0"
      variant="outline"
      @click="$emit('export')"
      class="flex items-center gap-2"
    >
      <CopyIcon class="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
      <span>{{ $t("exportReport.btn") }}</span>
    </UiButton>
  </div>
</template>

<script setup lang="ts">
import { RotateCwIcon, BarChart2Icon, CopyIcon } from "@lucide/vue";
import type { SteamGame } from "~/types";

defineProps<{
  games: SteamGame[];
  isLoading: boolean;
}>();

defineEmits<{
  (e: "refresh"): void;
  (e: "export"): void;
}>();
</script>
