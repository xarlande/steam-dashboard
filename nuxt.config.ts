// https://nuxt.com/docs/api/configuration/nuxt-config

import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/fonts", "shadcn-nuxt", "@nuxtjs/i18n", "@vueuse/nuxt", "@nuxtjs/color-mode"],
  colorMode: {
    classSuffix: "", // додає .dark, а не .dark-mode
    preference: "system", // fallback до системної теми
    storageKey: "color-mode",
  },
  fonts: {
    defaults: {
      subsets: ["Inter"],
    },
  },
  i18n: {
    strategy: "prefix_and_default",
    locales: [
      { code: "uk", name: "UA", file: "uk.json" },
      { code: "en", name: "EN", file: "en.json" },
      { code: "ru", name: "RU", file: "ru.json" },
    ],
    defaultLocale: "uk",
    detectBrowserLanguage: {
      redirectOn: "root",
      useCookie: true,
      cookieKey: "i18n_redirected",
    },
  },
  css: ["./app/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },
});
