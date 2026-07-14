<template>
  <UiDialog v-model:open="isOpen">
    <UiDialogContent class="sm:max-w-lg">
      <UiDialogHeader>
        <div class="flex items-center gap-3">
          <ShieldIcon class="h-10 w-10 text-cyan-400" />
          <div>
            <UiDialogTitle class="text-lg font-bold">
              {{ $t("index.credentials.title") }}
            </UiDialogTitle>
            <UiDialogDescription class="mt-0.5 text-xs text-neutral-400">
              {{ $t("index.credentials.description") }}
            </UiDialogDescription>
          </div>
        </div>
      </UiDialogHeader>

      <div class="mt-2 space-y-5">
        <!-- Steam ID Input -->
        <div>
          <UiLabel
            for="dialog-steamId"
            class="text-muted-foreground mb-2 block text-xs font-semibold tracking-wider uppercase"
          >
            {{ $t("index.credentials.steamId") }}
          </UiLabel>
          <UiInput
            type="text"
            id="dialog-steamId"
            v-model="localSteamId"
            :placeholder="$t('index.credentials.steamIdPlaceholder')"
          />
          <p class="mt-1.5 text-[11px] leading-normal text-neutral-500">
            {{ $t("index.credentials.steamIdHelp") }}
          </p>
        </div>

        <!-- Server Config Info -->

        <!-- Feedback message -->
        <transition name="slide-fade">
          <div
            v-if="feedbackMessage"
            class="flex items-center gap-2.5 rounded-xl p-3 text-xs font-semibold"
            :class="
              feedbackType === 'success'
                ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                : 'border border-rose-500/20 bg-rose-500/10 text-rose-400'
            "
          >
            <CheckCircle2Icon v-if="feedbackType === 'success'" class="h-4 w-4 shrink-0" />
            <AlertCircleIcon v-else class="h-4 w-4 shrink-0" />
            {{ feedbackMessage }}
          </div>
        </transition>

        <!-- Import / Export row -->
        <div class="flex items-center gap-3 pt-2">
          <!-- Export Button -->
          <UiButton variant="outline" class="flex-1" size="sm" @click="handleExport">
            <UploadIcon class="mr-1.5 h-3.5 w-3.5" />
            {{ $t("index.credentials.exportSettings") }}
          </UiButton>

          <!-- Import Button -->
          <UiButton variant="outline" class="flex-1" size="sm" @click="triggerImport">
            <DownloadIcon class="mr-1.5 h-3.5 w-3.5" />
            {{ $t("index.credentials.importSettings") }}
          </UiButton>

          <!-- Hidden file input for import -->
          <input
            ref="importFileInput"
            type="file"
            accept=".json,application/json"
            class="hidden"
            @change="handleImportFile"
          />
        </div>

        <!-- Save / Reset actions -->
        <div class="flex items-center justify-between gap-3 border-t border-neutral-800 pt-4">
          <UiButton variant="ghost" @click="handleClear" size="sm">
            <Trash2Icon class="mr-1.5 h-4 w-4 shrink-0" />
            {{ $t("common.reset") }}
          </UiButton>

          <UiButton size="sm" @click="handleSave">
            <CheckIcon class="mr-1.5 h-4 w-4 shrink-0" />
            {{ $t("common.save") }}
          </UiButton>
        </div>
      </div>
    </UiDialogContent>
  </UiDialog>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import {
  ShieldIcon,
  UploadIcon,
  DownloadIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  Trash2Icon,
  CheckIcon,
} from "@lucide/vue";

const isOpen = defineModel<boolean>("open");

const { t } = useI18n();

// Cookie instances
const cookieSteamId = useStateSteamId();

// Local form states
const localSteamId = ref("");

// Initialize on open
watch(
  isOpen,
  (newVal) => {
    if (newVal) {
      localSteamId.value = cookieSteamId.value || "";
    }
  },
  { immediate: true },
);

// Feedback states
const feedbackMessage = ref("");
const feedbackType = ref<"success" | "error">("success");
let feedbackTimer: ReturnType<typeof setTimeout> | null = null;
const importFileInputRef = useTemplateRef("importFileInput");

function showFeedback(message: string, type: "success" | "error" = "success") {
  if (feedbackTimer) {
    clearTimeout(feedbackTimer);
  }
  feedbackMessage.value = message;
  feedbackType.value = type;
  feedbackTimer = setTimeout(() => {
    feedbackMessage.value = "";
  }, 3500);
}

function handleSave() {
  cookieSteamId.value = localSteamId.value.trim();
  isOpen.value = false;
}

function handleClear() {
  localSteamId.value = "";
  cookieSteamId.value = "";
  isOpen.value = false;
}

function handleExport() {
  const currentSteamId = localSteamId.value.trim() || cookieSteamId.value || "";

  const settings = {
    exportedAt: new Date().toISOString(),
    steam_game_categories: (() => {
      try {
        return JSON.parse(localStorage.getItem("steam_game_categories") || "{}");
      } catch {
        return {};
      }
    })(),
    steam_id: currentSteamId,
    steam_language: localStorage.getItem("steam_language") || "uk",
    version: 1,
  };

  const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `steam-dashboard-settings-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showFeedback(t("index.credentials.exportSuccess"), "success");
}

function triggerImport() {
  importFileInputRef.value?.click();
}

function handleImportFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const raw = e.target?.result as string;
      const data = JSON.parse(raw);

      if (typeof data !== "object" || data === null) {
        throw new Error("Not an object");
      }

      if (data.steam_id !== undefined) {
        const val = String(data.steam_id);
        cookieSteamId.value = val;
        localSteamId.value = val;
      }

      showFeedback(t("index.credentials.importSuccess"), "success");
    } catch {
      showFeedback(t("index.credentials.importError"), "error");
    }
  };
  reader.onerror = () => showFeedback(t("index.credentials.importFileError"), "error");
  reader.readAsText(file);

  (event.target as HTMLInputElement).value = "";
}
</script>
