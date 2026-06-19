// https://nuxt.com/docs/api/configuration/nuxt-config

import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/fonts', 'shadcn-nuxt', '@nuxtjs/i18n'],
  fonts: {
    fontsource: {
      families: ['Inter']
    }
  },
  i18n: {
    defaultLocale: 'uk',
    strategy: 'no_prefix',
    locales: [
      { code: 'uk', iso: 'uk-UA', file: 'uk.json' },
      { code: 'en', iso: 'en-US', file: 'en.json' },
      { code: 'ru', iso: 'ru-RU', file: 'ru.json' }
    ]
  },
  css: ['./app/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ]
  }
})