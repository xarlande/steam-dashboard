<template>
  <UiDialog v-model:open="isOpen">
    <UiDialogContent class="sm:max-w-lg">
      <UiDialogHeader>
        <div class="flex items-center gap-3">
          <ShieldIcon class="h-10 w-10 text-cyan-600 dark:text-cyan-400" />
          <div>
            <UiDialogTitle class="text-lg font-bold">
              {{ $t("index.credentials.title") }}
            </UiDialogTitle>
            <UiDialogDescription class="text-muted-foreground mt-0.5 text-xs">
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
          <p class="text-muted-foreground/80 mt-1.5 text-[11px] leading-normal">
            {{ $t("index.credentials.steamIdHelp") }}
          </p>
        </div>

        <!-- Import / Export row -->
        <div class="flex items-center gap-3 pt-2">
          <!-- Export Button -->
          <UiButton variant="outline" class="flex-1" size="sm" @click="exportSettings">
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
        <div class="border-border/60 flex items-center justify-between gap-3 border-t pt-4">
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
import { useTemplateRef } from "vue";
import { ShieldIcon, UploadIcon, DownloadIcon, Trash2Icon, CheckIcon } from "@lucide/vue";

const isOpen = defineModel<boolean>("open");

const importFileInputRef = useTemplateRef("importFileInput");

const { localSteamId, saveSettings, clearSettings, exportSettings, importSettingsFile } =
  useSettings(isOpen);

function handleSave() {
  saveSettings();
  isOpen.value = false;
}

function handleClear() {
  clearSettings();
  isOpen.value = false;
}

function triggerImport() {
  importFileInputRef.value?.click();
}

function handleImportFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    importSettingsFile(file);
  }
  (event.target as HTMLInputElement).value = "";
}
</script>
