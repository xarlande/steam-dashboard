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
        </div>

        <!-- Right Slot (Actions + Shared selectors) -->
        <div class="flex items-center gap-3 self-end sm:self-auto">
          <slot name="header-actions" />

          <!-- Shared Language Selector -->
          <UiSelect :model-value="locale" @update:model-value="handleLangChange">
            <UiSelectTrigger>
              <UiSelectValue :placeholder="$t('index.credentials.displayLanguage')" />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem v-for="lang in locales" :key="lang.code" :value="lang.code">
                {{ lang.name }}
              </UiSelectItem>
            </UiSelectContent>
          </UiSelect>

          <!-- Shared Theme Toggle Button -->
          <UiButton variant="outline" size="icon" @click="toggleTheme" title="Toggle theme">
            <SunIcon v-if="colorMode.value === 'dark'" class="w-5 h-5" />
            <MoonIcon v-else class="w-5 h-5" />
          </UiButton>
        </div>
      </header>

      <!-- Page Content -->
      <slot />
    </main>
  </div>
</template>

<script lang="ts" setup>
import { SunIcon, MoonIcon } from "@lucide/vue";

const { locales, setLocale, locale } = useI18n();

const colorMode = useColorMode();

async function handleLangChange(value: any) {
  if (typeof value === "string") {
    localStorage.setItem("steam_language", value);
    await setLocale(value as any);
  }
}

function toggleTheme() {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
}
</script>
