<template>
  <UiDialog v-model:open="open">
    <UiDialogContent
      class="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
      :show-close-button="false"
    >
      <!-- Modal Header -->
      <div class="border-border/60 flex items-center justify-between border-b p-5">
        <div class="flex items-center gap-3">
          <FileTextIcon class="h-5.5 w-5.5 text-cyan-600 dark:text-cyan-400" />
          <div>
            <h3 class="text-foreground text-base font-bold">
              {{ $t("exportReport.title") }}
            </h3>
            <p class="text-muted-foreground mt-0.5 text-xs leading-normal">
              {{ $t("exportReport.desc") }}
            </p>
          </div>
        </div>
        <UiButton
          variant="ghost"
          size="icon"
          @click="open = false"
          class="hover:bg-accent h-8 w-8 rounded-full"
        >
          <XIcon class="h-4 w-4" />
        </UiButton>
      </div>

      <!-- Modal Body (Content) -->
      <div class="flex-1 space-y-5 overflow-y-auto p-5">
        <!-- Loading Progress Section -->
        <div
          v-if="isCopying"
          class="flex flex-col items-center justify-center space-y-4 py-8 text-center"
        >
          <div class="relative flex items-center justify-center">
            <Loader2Icon class="h-10 w-10 animate-spin text-cyan-600 dark:text-cyan-400" />
          </div>
          <div class="space-y-1">
            <p class="text-foreground text-sm font-bold">
              {{ $t("exportReport.fetchProgress", { current: copyProgress, total: copyTotal }) }}
            </p>
            <p class="text-muted-foreground max-w-md truncate text-xs italic">
              {{ $t("exportReport.fetching", { game: copyCurrentGameName }) }}
            </p>
          </div>

          <!-- Progress Bar -->
          <UiProgress
            :model-value="(copyProgress / copyTotal) * 100"
            class="progress-cyan bg-muted h-2.5 w-full max-w-md overflow-hidden rounded-full"
          />

          <UiButton variant="outline" size="sm" @click="cancelExportReport">
            {{ $t("exportReport.cancel") }}
          </UiButton>
        </div>

        <!-- Report Preview Section -->
        <div v-else class="space-y-5">
          <!-- Empty state: Click to generate -->
          <div
            v-if="!copyReportText"
            class="flex flex-col items-center justify-center space-y-4 py-12 text-center"
          >
            <div class="rounded-full bg-cyan-500/10 p-3 text-cyan-600 dark:text-cyan-400">
              <FileTextIcon class="h-8 w-8" />
            </div>

            <!-- Option checkbox before generating -->
            <div
              class="border-border/50 bg-muted/30 mb-2 flex items-center gap-2.5 rounded-xl border px-4 py-2.5"
            >
              <UiCheckbox id="include-achievements-empty" v-model="includeAchievements" />
              <UiLabel
                for="include-achievements-empty"
                class="text-muted-foreground cursor-pointer text-xs font-semibold select-none"
              >
                {{ $t("exportReport.optIncludeAchievements") }}
              </UiLabel>
            </div>

            <UiButton @click="startExportReport">
              {{ $t("exportReport.generateBtn") }}
            </UiButton>
          </div>

          <!-- Report Text Area -->
          <div v-else class="space-y-3">
            <!-- Option checkbox active -->
            <div
              class="border-border/50 bg-muted/30 flex items-center gap-2.5 rounded-xl border px-4 py-2.5"
            >
              <UiCheckbox id="include-achievements-active" v-model="includeAchievements" />
              <UiLabel
                for="include-achievements-active"
                class="text-muted-foreground cursor-pointer text-xs font-semibold select-none"
              >
                {{ $t("exportReport.optIncludeAchievements") }}
              </UiLabel>
            </div>

            <UiTextarea
              readonly
              class="border-border/60 bg-muted/40 text-foreground h-80 w-full rounded-xl p-3.5 font-mono text-xs focus-visible:ring-cyan-500/50"
              :model-value="copyReportText"
              placeholder="Report will appear here..."
            />
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="border-border/60 bg-muted/20 flex items-center justify-between border-t p-4">
        <span class="text-muted-foreground text-xs">
          {{ copyReportText ? $t("exportReport.totalGames", { count: totalCount }) : "" }}
        </span>
        <div class="flex items-center gap-3">
          <UiButton
            v-if="copyReportText && !isCopying"
            variant="outline"
            @click="startExportReport"
            size="sm"
            class="text-xs"
          >
            🔄 {{ $t("roulette.again") }}
          </UiButton>
          <UiButton
            v-if="copyReportText && !isCopying"
            @click="copyTextToClipboard(copyReportText)"
            size="sm"
            class="flex items-center gap-1.5 text-xs"
          >
            <CopyIcon class="h-4 w-4" />
            <span>{{ $t("exportReport.copyBtn") }}</span>
          </UiButton>
          <UiButton variant="secondary" @click="open = false" size="sm" class="text-xs">
            {{ $t("common.close") }}
          </UiButton>
        </div>
      </div>
    </UiDialogContent>
  </UiDialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Loader2Icon, FileTextIcon, CopyIcon, XIcon } from "@lucide/vue";
import type { SteamGame } from "~/types";

const props = defineProps<{
  games: SteamGame[];
}>();

const open = defineModel<boolean>("open", { default: false });

const includeAchievements = ref(true);

const {
  totalCount,
  isCopying,
  copyProgress,
  copyTotal,
  copyCurrentGameName,
  copyReportText,
  startExportReport,
  cancelExportReport,
  copyTextToClipboard,
} = useAchievementsExport(() => props.games, includeAchievements);
</script>

<style scoped>
/* Fade transition for modals */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
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

.progress-cyan :deep([data-slot="progress-indicator"]) {
  background-color: var(--color-cyan-500, #06b6d4) !important;
}
</style>
