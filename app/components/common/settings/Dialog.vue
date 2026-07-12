<template>
  <UiDialog v-model:open="isOpen">
    <UiDialogContent class="sm:max-w-[425px]">
      <UiDialogHeader>
        <div class="flex items-center gap-3">
          <ShieldIcon class="w-6 h-6 text-cyan-400" />
          <div>
            <UiDialogTitle class="text-lg font-bold">
              {{ $t("index.credentials.title") }}
            </UiDialogTitle>
            <UiDialogDescription class="text-xs text-neutral-400 mt-0.5">
              {{ $t("index.credentials.description") }}
            </UiDialogDescription>
          </div>
        </div>
      </UiDialogHeader>

      <form @submit.prevent="handleSave" class="space-y-5 mt-2">
        <!-- API Key Input -->
        <div>
          <UiLabel
            for="dialog-apiKey"
            class="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2"
          >
            {{ $t("index.credentials.apiKey") }}
          </UiLabel>
          <UiInput
            type="password"
            id="dialog-apiKey"
            v-model="localApiKey"
            :placeholder="$t('index.credentials.apiKeyPlaceholder')"
          />
          <p class="mt-1.5 text-[11px] text-neutral-500 leading-normal">
            {{ $t("index.credentials.apiKeyHelp") }}
            <a
              href="https://steamcommunity.com/dev/apikey"
              target="_blank"
              class="text-cyan-400 hover:underline transition-colors font-medium"
            >
              Steam Dev API Key </a
            >.
          </p>
        </div>

        <!-- Steam ID Input -->
        <div>
          <UiLabel
            for="dialog-steamId"
            class="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2"
          >
            {{ $t("index.credentials.steamId") }}
          </UiLabel>
          <UiInput
            type="text"
            id="dialog-steamId"
            v-model="localSteamId"
            :placeholder="$t('index.credentials.steamIdPlaceholder')"
          />
          <p class="mt-1.5 text-[11px] text-neutral-500 leading-normal">
            {{ $t("index.credentials.steamIdHelp") }}
          </p>
        </div>

        <!-- Server Config Info -->
        <div
          v-if="loadedFromEnv"
          class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-start gap-2.5"
        >
          <CheckCircle2Icon class="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <span class="font-bold">{{ $t("index.credentials.activeConfig") }}</span>
            {{ $t("index.credentials.activeConfigHelp") }}
          </div>
        </div>

        <!-- Feedback message -->
        <transition name="slide-fade">
          <div
            v-if="feedbackMessage"
            class="p-3 rounded-xl text-xs flex items-center gap-2.5 font-semibold"
            :class="
              feedbackType === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
            "
          >
            <CheckCircle2Icon v-if="feedbackType === 'success'" class="w-4 h-4 shrink-0" />
            <AlertCircleIcon v-else class="w-4 h-4 shrink-0" />
            {{ feedbackMessage }}
          </div>
        </transition>

        <!-- Save / Reset actions -->
        <div class="flex items-center gap-3 pt-2">
          <UiButton type="submit" :disabled="isLoading" class="flex-1">
            <RotateCwIcon v-if="isLoading" class="w-4 h-4 mr-2 animate-spin" />
            <span>{{ isLoading ? $t("common.loading") : $t("index.saveLoadBtn") }}</span>
          </UiButton>

          <UiButton
            v-if="hasSavedCredentials"
            type="button"
            variant="destructive"
            @click="handleClear"
          >
            {{ $t("common.reset") }}
          </UiButton>
        </div>

        <!-- Import / Export row -->
        <div class="flex items-center gap-3 pt-1 border-t border-border/40 pt-4">
          <!-- Export Button -->
          <UiButton type="button" variant="outline" class="flex-1 text-xs" @click="handleExport">
            <UploadIcon class="w-4 h-4 mr-2" />
            {{ $t("index.credentials.exportSettings") }}
          </UiButton>

          <!-- Import Button -->
          <UiButton type="button" variant="outline" class="flex-1 text-xs" @click="triggerImport">
            <DownloadIcon class="w-4 h-4 mr-2" />
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
      </form>
    </UiDialogContent>
  </UiDialog>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import {
  ShieldIcon,
  RotateCwIcon,
  UploadIcon,
  DownloadIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
} from "@lucide/vue";

const isOpen = defineModel<boolean>("open");
const apiKey = defineModel<string>("apiKey", { default: "" });
const steamId = defineModel<string>("steamId", { default: "" });

const props = defineProps<{
  isLoading?: boolean;
  loadedFromEnv?: boolean;
  hasSavedCredentials?: boolean;
}>();

const emit = defineEmits<{
  (e: "save"): void;
  (e: "clear"): void;
  (e: "import", data: any): void;
}>();

const { t } = useI18n();

// Cookie instances
const cookieApiKey = useSteamApiKey();
const cookieSteamId = useSteamId();

// Local form states
const localApiKey = ref("");
const localSteamId = ref("");

// Initialize on open
watch(
  isOpen,
  (newVal) => {
    if (newVal) {
      localApiKey.value = apiKey.value || cookieApiKey.value || "";
      localSteamId.value = steamId.value || cookieSteamId.value || "";
    }
  },
  { immediate: true },
);

// Feedback states
const feedbackMessage = ref("");
const feedbackType = ref<"success" | "error">("success");
let feedbackTimer: ReturnType<typeof setTimeout> | null = null;
const importFileInput = ref<HTMLInputElement | null>(null);

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
  if (!localApiKey.value.trim() || !localSteamId.value.trim()) {
    if (!props.loadedFromEnv) {
      showFeedback(t("index.credentials.validationError"), "error");
      return;
    }
  }

  // Update parent models
  apiKey.value = localApiKey.value.trim();
  steamId.value = localSteamId.value.trim();

  // Update cookies using user-specified cookie helpers
  cookieApiKey.value = localApiKey.value.trim();
  cookieSteamId.value = localSteamId.value.trim();

  // Update localStorage (as useGameLibrary uses it)
  localStorage.setItem("steam_api_key", localApiKey.value.trim());
  localStorage.setItem("steam_id", localSteamId.value.trim());

  emit("save");
  isOpen.value = false;
}

function handleClear() {
  localApiKey.value = "";
  localSteamId.value = "";

  apiKey.value = "";
  steamId.value = "";

  // Clear cookies using cookie helpers
  cookieApiKey.value = "";
  cookieSteamId.value = "";

  localStorage.removeItem("steam_api_key");
  localStorage.removeItem("steam_id");

  emit("clear");
  isOpen.value = false;
}

function handleExport() {
  const currentApiKey =
    localApiKey.value.trim() || cookieApiKey.value || localStorage.getItem("steam_api_key") || "";
  const currentSteamId =
    localSteamId.value.trim() || cookieSteamId.value || localStorage.getItem("steam_id") || "";

  const settings = {
    exportedAt: new Date().toISOString(),
    steam_api_key: currentApiKey,
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
  importFileInput.value?.click();
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

      if (data.steam_api_key !== undefined) {
        const val = String(data.steam_api_key);
        localStorage.setItem("steam_api_key", val);
        cookieApiKey.value = val;
        localApiKey.value = val;
        apiKey.value = val;
      }
      if (data.steam_id !== undefined) {
        const val = String(data.steam_id);
        localStorage.setItem("steam_id", val);
        cookieSteamId.value = val;
        localSteamId.value = val;
        steamId.value = val;
      }
      if (data.steam_game_categories && typeof data.steam_game_categories === "object") {
        localStorage.setItem("steam_game_categories", JSON.stringify(data.steam_game_categories));
      }

      showFeedback(t("index.credentials.importSuccess"), "success");

      emit("import", data);
    } catch {
      showFeedback(t("index.credentials.importError"), "error");
    }
  };
  reader.onerror = () => showFeedback(t("index.credentials.importFileError"), "error");
  reader.readAsText(file);

  (event.target as HTMLInputElement).value = "";
}
</script>
