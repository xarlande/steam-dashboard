<template>
  <div
    class="relative min-h-screen bg-background text-foreground transition-colors duration-300 overflow-x-hidden font-sans pb-16 selection:bg-cyan-500/30 selection:text-cyan-200 dark:bg-[radial-gradient(circle_at_20%_-20%,rgba(6,182,212,0.08),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.06),transparent_50%)] bg-[radial-gradient(circle_at_20%_-20%,rgba(6,182,212,0.04),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.03),transparent_50%)]"
  >
    <!-- Main Container -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <!-- Shared Header -->
      <header
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8 mb-8 border-b border-border/60"
      >
        <!-- Left Slot (e.g. Title or Back Button) -->
        <div class="flex items-center gap-3">
          <slot name="header-left" />
          <UiButton variant="outline" as-child class="group" v-if="showBackButton">
            <NuxtLinkLocale to="/" class="flex items-center gap-2">
              <ArrowLeftIcon
                class="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1"
              />
              <span>{{ $t("game.backToLibrary") }}</span>
            </NuxtLinkLocale>
          </UiButton>
          <template v-else>
            <div class="p-2.5 rounded-xl bg-card border border-border shadow-xs">
              <!-- Gamepad Icon -->
              <Gamepad2Icon class="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h1
                class="text-2xl sm:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r dark:from-neutral-50 dark:via-neutral-100 dark:to-neutral-400 from-neutral-900 via-neutral-800 to-neutral-600"
              >
                {{ $t("index.title") }}
              </h1>
              <p class="text-xs sm:text-sm text-muted-foreground font-medium">
                {{ $t("index.subtitle") }}
              </p>
            </div>
          </template>
        </div>

        <!-- Right Slot (Actions + Shared selectors) -->
        <div class="flex items-center gap-3 self-end sm:self-auto">
          <slot name="header-actions" />

          <UiButton variant="outline" @click="showSettings = !showSettings">
            <SettingsIcon class="w-4 h-4 mr-2" />
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
            <SunIcon class="dark:hidden block w-5 h-5" />
            <MoonIcon class="hidden dark:block w-5 h-5" />
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

const showSettings = useSettingDialog();

async function handleLangChange(value: any) {
  if (typeof value === "string") {
    localStorage.setItem("steam_language", value);
    await setLocale(value as any);
  }
}

const showBackButton = computed(() => route.meta?.showBackButton ?? false);
const showHeader = computed(() => route.meta?.showHeader ?? true);

function toggleTheme() {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
}
</script>
