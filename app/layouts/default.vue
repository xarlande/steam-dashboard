<template>
  <div
    class="bg-background text-foreground relative min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_20%_-20%,rgba(6,182,212,0.04),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.03),transparent_50%)] pb-16 font-sans transition-colors duration-300 selection:bg-cyan-500/30 selection:text-cyan-900 dark:selection:text-cyan-200 dark:bg-[radial-gradient(circle_at_20%_-20%,rgba(6,182,212,0.08),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.06),transparent_50%)]"
  >
    <!-- Main Container -->
    <main class="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
      <!-- Shared Header -->
      <header
        class="border-border/60 mb-8 flex flex-col gap-4 border-b pb-8 sm:flex-row sm:items-center sm:justify-between"
      >
        <!-- Left Slot (e.g. Title or Back Button) -->
        <div class="flex items-center gap-3">
          <slot name="header-left" />
          <UiButton variant="outline" as-child class="group" v-if="showBackButton">
            <NuxtLinkLocale to="/" class="flex items-center gap-2">
              <ArrowLeftIcon
                class="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
              />
              <span>{{ $t("game.backToLibrary") }}</span>
            </NuxtLinkLocale>
          </UiButton>
          <template v-else>
            <div class="bg-card border-border rounded-xl border p-2.5 shadow-xs">
              <!-- Gamepad Icon -->
              <Gamepad2Icon class="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <h1
                class="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-600 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent sm:text-3xl dark:from-neutral-50 dark:via-neutral-100 dark:to-neutral-400"
              >
                {{ $t("index.title") }}
              </h1>
              <p class="text-muted-foreground text-xs font-medium sm:text-sm">
                {{ $t("index.subtitle") }}
              </p>
            </div>
          </template>
        </div>

        <!-- Right Slot (Actions + Shared selectors) -->
        <div class="flex items-center gap-3 self-end sm:self-auto">
          <slot name="header-actions" />

          <UiButton variant="outline" @click="showSettings = !showSettings">
            <SettingsIcon class="mr-2 h-4 w-4" />
            <span>{{ $t("index.configBtn") }}</span>
          </UiButton>

          <!-- Shared Language Selector -->
          <UiSelect :model-value="locale" @update:model-value="handleLangChange">
            <UiSelectTrigger>
              <UiSelectValue>
                {{
                  locales.find((loc) => loc.code === locale)?.name ??
                  $t("index.credentials.displayLanguage")
                }}
              </UiSelectValue>
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem v-for="lang in locales" :key="lang.code" :value="lang.code">
                {{ lang.name }}
              </UiSelectItem>
            </UiSelectContent>
          </UiSelect>

          <!-- Shared Theme Toggle Button -->
          <UiButton variant="outline" size="icon" @click="toggleTheme" title="Toggle theme">
            <SunIcon class="block h-5 w-5 dark:hidden" />
            <MoonIcon class="hidden h-5 w-5 dark:block" />
          </UiButton>
        </div>
      </header>

      <CommonSettingsDialog v-model:open="showSettings"></CommonSettingsDialog>

      <!-- Page Content -->
      <slot />
    </main>
    <Toaster position="top-right" />
  </div>
</template>

<script lang="ts" setup>
import { SunIcon, MoonIcon, SettingsIcon, ArrowLeftIcon, Gamepad2Icon } from "@lucide/vue";
import "vue-sonner/style.css";
import { Toaster } from "@/components/ui/sonner";

const { locales, setLocale, locale } = useI18n();
const route = useRoute();

const colorMode = useColorMode();

const showSettings = useStateSettingsDialogOpen();

async function handleLangChange(value: any) {
  if (typeof value === "string") {
    await setLocale(value as any);
  }
}

const showBackButton = computed(() => route.meta?.showBackButton ?? false);
const showHeader = computed(() => route.meta?.showHeader ?? true);

function toggleTheme() {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
}
</script>
