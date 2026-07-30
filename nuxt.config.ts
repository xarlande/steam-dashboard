// https://nuxt.com/docs/api/configuration/nuxt-config

import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  app: {
    pageTransition: { name: "page", mode: "out-in" },
  },
  modules: ["@nuxt/fonts", "shadcn-nuxt", "@nuxtjs/i18n", "@vueuse/nuxt", "@nuxtjs/color-mode"],
  colorMode: {
    classSuffix: "", // додає .dark, а не .dark-mode
    preference: "system", // fallback до системної теми
    storageKey: "color-mode",
  },
  fonts: {},
  i18n: {
    strategy: "prefix_and_default",
    locales: [
      { code: "uk", name: "UA", file: "uk.json" },
      { code: "en", name: "EN", file: "en.json" },
      { code: "ru", name: "RU", file: "ru.json" },
    ],
    defaultLocale: "uk",
  },
  css: ["~/assets/css/main.css", "vue-sonner/style.css"],
  vite: {
    plugins: [tailwindcss() as any],
    optimizeDeps: {
      include: [
        "@lucide/vue",
        "class-variance-authority",
        "clsx",
        "reka-ui",
        "tailwind-merge",
        "vue-sonner",
      ],
    },
  },
});
