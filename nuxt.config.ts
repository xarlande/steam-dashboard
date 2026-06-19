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
    strategy: 'no_prefix',
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