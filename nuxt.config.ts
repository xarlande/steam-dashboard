// https://nuxt.com/docs/api/configuration/nuxt-config

import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/fonts', 'shadcn-nuxt', '@nuxtjs/i18n', '@vueuse/nuxt', '@nuxtjs/color-mode'],
  colorMode: {
    classSuffix: '',       // додає .dark, а не .dark-mode
    preference: 'system',  // fallback до системної теми
    storageKey: 'color-mode',
  },
  fonts: {
    defaults: {
      subsets: ['Inter'],
    }
  },
  i18n: {
    strategy: 'prefix_except_default',
    locales: [
      { code: 'uk', file: 'uk.json' },
      { code: 'en', file: 'en.json' },
      { code: 'ru', file: 'ru.json' }
    ],
    defaultLocale: 'uk',
  },
  css: ['./app/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ]
  }
})