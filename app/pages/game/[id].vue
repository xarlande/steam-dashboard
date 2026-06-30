<template>
  <div class="relative min-h-screen bg-background text-foreground transition-colors duration-300 overflow-x-hidden font-sans pb-16 selection:bg-cyan-500/30 selection:text-cyan-200 dark:bg-[radial-gradient(circle_at_20%_-20%,rgba(6,182,212,0.08),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.06),transparent_50%)] bg-[radial-gradient(circle_at_20%_-20%,rgba(6,182,212,0.04),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.03),transparent_50%)]">
    
    <!-- Main Container -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      
      <!-- Back Navigation Header -->
      <header class="flex items-center justify-between pb-6 mb-8 border-b border-border/60">
        <UiButton 
          variant="outline"
          as-child
          class="group"
        >
          <NuxtLink to="/" class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>{{ $t('game.backToLibrary') }}</span>
          </NuxtLink>
        </UiButton>

        <div class="flex items-center gap-3">
          <!-- Language Selector dropdown (shadcn select) -->
          <UiSelect v-model="locale" @update:modelValue="handleLangChange">
            <UiSelectTrigger >
              <UiSelectValue :placeholder="$t('index.credentials.displayLanguage')" />
            </UiSelectTrigger>
            <UiSelectContent >
              <UiSelectItem value="uk">UA</UiSelectItem>
              <UiSelectItem value="en">EN</UiSelectItem>
              <UiSelectItem value="ru">RU</UiSelectItem>
            </UiSelectContent>
          </UiSelect>

          <!-- Theme Toggle Button -->
          <UiButton
            variant="outline"
            size="icon"
            @click="toggleTheme"
            title="Toggle theme"
          >
            <svg v-if="colorMode.value === 'dark'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="4"></circle>
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
            </svg>
          </UiButton>
        </div>
      </header>

      <!-- Loading State (Hero Details) -->
      <section v-if="isLoading" class="mb-8">
        <UiCard class="bg-neutral-900 border border-neutral-800/60 p-6 sm:p-8 animate-pulse">
          <div class="flex flex-col md:flex-row gap-6 items-center">
            <UiSkeleton class="w-full md:w-[220px] aspect-[460/215] rounded-xl" />
            <div class="flex-1 space-y-4 w-full">
              <UiSkeleton class="h-8 w-1/2 rounded-md" />
              <UiSkeleton class="h-4 w-1/4 rounded-md" />
              <UiSkeleton class="h-4 w-3/4 rounded-md pt-4" />
            </div>
          </div>
        </UiCard>
      </section>

      <!-- Loaded State: Hero Game Info -->
      <section v-else-if="!error" class="mb-8 animate-fade-in">
        <UiCard>
          <UiCardContent class="flex flex-col md:flex-row gap-6 md:items-center justify-between">
            <!-- Banner & Name -->
            <div class="flex flex-col sm:flex-row gap-5 items-center text-center sm:text-left">
              <div class="relative w-[220px] aspect-[460/215] rounded-xl overflow-hidden shadow-md border border-neutral-850 shrink-0">
                <img 
                  :src="headerImgUrl" 
                  :alt="gameName"
                  class="w-full h-full object-cover"
                  @error="handleImageError"
                />
              </div>
              
              <div class="space-y-2">
                <UiBadge variant="secondary">
                  App ID: {{ appid }}
                </UiBadge>
                <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                  {{ gameName }}
                </h2>
                <div class="flex flex-wrap justify-center sm:justify-start items-center gap-4 pt-1 text-sm text-muted-foreground font-medium">
                  <div class="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>{{ $t('game.completionProgress') }}: <span class="text-foreground font-semibold">{{ unlockedCount }}</span> / <span class="text-foreground font-semibold">{{ totalCount }}</span></span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Achievements Progress (shadcn Progress) -->
            <div class="flex flex-col items-center justify-center shrink-0 p-4 rounded-xl bg-muted/40 border border-border min-w-[150px]">
              <span class="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{{ $t('game.unlockedLabel') }}</span>
              <span class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-indigo-400 mt-1 tracking-tight">
                {{ unlockedPercent }}%
              </span>
              <UiProgress :model-value="unlockedPercent" class="w-full mt-3" />
            </div>
          </UiCardContent>
        </UiCard>
      </section>

      <!-- Easy Targets / The Next Achievements -->
      <section v-if="!isLoading && !error && nextAchievements.length > 0" class="mb-8 animate-fade-in">
        <UiCard class="border-cyan-500/20 bg-gradient-to-r from-cyan-950/10 to-transparent shadow-xs">
          <UiCardContent class="p-6">
            <div class="flex items-center gap-2.5 mb-4">
              <span class="text-xl">🎯</span>
              <div>
                <h3 class="text-base font-bold text-foreground leading-snug">{{ $t('game.nextTitle') }}</h3>
                <p class="text-xs text-muted-foreground mt-0.5">{{ $t('game.nextDesc') }}</p>
              </div>
            </div>

            <!-- List of 3 next targets -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                v-for="ach in nextAchievements" 
                :key="'next-' + ach.apiname"
                class="flex items-center gap-3.5 p-3.5 rounded-2xl border border-border bg-card/30 hover:bg-card/60 transition-all group"
              >
                <!-- Gray Icon, becomes colored on hover -->
                <div class="relative w-12 h-12 rounded-xl overflow-hidden bg-muted border border-border/60 shrink-0">
                  <!-- Gray icon by default, hidden on hover -->
                  <img 
                    :src="ach.icongray" 
                    :alt="ach.name"
                    class="w-full h-full object-cover group-hover:hidden transition-transform"
                    @error="handleIconError"
                  />
                  <!-- Colored icon shown on hover -->
                  <img 
                    :src="ach.icon" 
                    :alt="ach.name"
                    class="w-full h-full object-cover hidden group-hover:block transition-transform"
                    @error="handleIconError"
                  />
                </div>

                <div class="min-w-0 flex-1">
                  <h4 class="text-xs font-bold text-foreground truncate group-hover:text-cyan-400 transition-colors" :title="ach.name">
                    {{ ach.name }}
                  </h4>
                  <p class="text-[10px] text-muted-foreground line-clamp-1 mt-0.5" :title="ach.description">
                    {{ ach.description || 'No description' }}
                  </p>
                  
                  <!-- Unlock Rate Badge -->
                  <div class="mt-2 flex items-center gap-1">
                    <UiBadge class="text-[9px] font-black bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/10 border-cyan-500/20 py-0.5 px-1.5 rounded-md">
                      {{ ach.global_percent }}% {{ $t('game.globalUnlocked') }}
                    </UiBadge>
                  </div>
                </div>
              </div>
            </div>

          </UiCardContent>
        </UiCard>
      </section>

      <!-- If 100% Completed, show congratulations -->
      <section v-else-if="!isLoading && !error && achievements.length > 0 && nextAchievements.length === 0" class="mb-8 animate-fade-in">
        <UiCard class="border-emerald-500/20 bg-gradient-to-r from-emerald-950/10 to-transparent shadow-xs">
          <UiCardContent class="p-6 flex items-center gap-4">
            <span class="text-3xl select-none">🏆</span>
            <div>
              <h3 class="text-base font-extrabold text-emerald-400 leading-snug">{{ $t('game.congratsTitle') }}</h3>
              <p class="text-xs text-muted-foreground mt-0.5 font-medium">{{ $t('game.congratsDesc') }}</p>
            </div>
          </UiCardContent>
        </UiCard>
      </section>

      <!-- Main Content Block -->
      <section v-if="!isLoading && !error" class="space-y-6 animate-fade-in">
        
        <!-- Filter Controls (Search + Tabs) -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border">
          
          <!-- Search in Achievements -->
          <div class="relative flex-1 max-w-md">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground z-10">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <UiInput 
              type="text" 
              v-model="searchQuery"
              :placeholder="$t('game.searchPlaceholder')" 
              class="w-full pl-9 pr-8"
            />
            <UiButton 
              v-if="searchQuery" 
              variant="ghost"
              size="icon"
              @click="searchQuery = ''"
              class="absolute right-0 top-0 bottom-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </UiButton>
          </div>

          <!-- Tabs: All, Unlocked, Locked (shadcn tabs) -->
          <div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-2 shrink-0">{{ $t('game.filterLabel') }}</span>
            <UiTabs v-model="filterBy" class="w-auto">
              <UiTabsList>
                <UiTabsTrigger value="all">{{ $t('game.filterAll') }} ({{ totalCount }})</UiTabsTrigger>
                <UiTabsTrigger value="unlocked">{{ $t('game.filterUnlocked') }} ({{ unlockedCount }})</UiTabsTrigger>
                <UiTabsTrigger value="locked">{{ $t('game.filterLocked') }} ({{ totalCount - unlockedCount }})</UiTabsTrigger>
              </UiTabsList>
            </UiTabs>
          </div>
        </div>

        <!-- Skeleton Grid while loading -->
        <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiCard v-for="i in 6" :key="i" class="p-4 flex gap-4 items-center">
            <UiSkeleton class="w-14 h-14 rounded-xl shrink-0" />
            <div class="flex-1 space-y-2">
              <UiSkeleton class="h-4.5 w-1/3 rounded-md" />
              <UiSkeleton class="h-3 w-3/4 rounded-md" />
            </div>
          </UiCard>
        </div>

        <!-- Achievements Grid -->
        <div v-else-if="filteredAchievements.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <!-- Achievement Card (shadcn Card) -->
          <UiCard 
            v-for="ach in filteredAchievements" 
            :key="ach.apiname"
            class="group flex gap-4 ach-card hover:-translate-y-0.5 p-4"
            :class="ach.achieved ? '' : 'opacity-60 transition-opacity hover:opacity-90'"
          >
            <!-- Icon -->
            <div class="relative w-14 h-14 rounded-xl overflow-hidden bg-muted border border-border shrink-0">
              <img 
                :src="ach.achieved ? ach.icon : ach.icongray" 
                :alt="ach.name"
                loading="lazy"
                class="w-full h-full object-cover ach-card-img group-hover:scale-[1.04]"
                @error="handleIconError"
              />
            </div>

            <!-- Text details -->
            <div class="flex flex-col justify-center min-w-0 flex-1 pr-2">
              <div class="flex items-start justify-between gap-2">
                <h4 class="font-bold text-sm sm:text-base group-hover:text-cyan-500 dark:group-hover:text-cyan-300 transition-colors truncate">
                  {{ ach.name }}
                </h4>
                
                <!-- Unlocked Badge (shadcn badge) -->
                <UiBadge 
                  v-if="ach.achieved" 
                >
                  {{ $t('game.unlockedLabel') }}
                </UiBadge>
              </div>
              
              <!-- Description -->
              <p class="text-xs text-muted-foreground line-clamp-2 mt-1 leading-normal pr-4">
                {{ ach.description || 'No description provided.' }}
              </p>

              <!-- Unlock relative time -->
              <p v-if="ach.achieved" class="text-[10px] text-muted-foreground mt-1.5 font-medium flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-muted-foreground/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>{{ $t('game.unlockedAt', { time: ach.unlocktime_relative }) }}</span>
              </p>
            </div>
          </UiCard>
        </div>

        <!-- Empty Grid/Search -->
        <UiCard v-else class="max-w-md mx-auto text-center">
          <UiCardContent>
            <div class="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto text-muted-foreground mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h3 class="font-bold text-base">{{ $t('game.noAchievements') }}</h3>
            <p class="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
              {{ $t('game.noAchievementsDesc') }}
            </p>
          </UiCardContent>
        </UiCard>

      </section>

      <!-- Global Error Alert / Back Action -->
      <section v-if="error" class="max-w-2xl mx-auto py-8">
        <div class="p-6 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive-foreground text-sm flex items-start gap-4 shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-destructive shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <div class="flex-1">
            <h3 class="font-extrabold text-base text-destructive mb-1">{{ $t('game.failedLoad') }}</h3>
            <p class="leading-relaxed">{{ error }}</p>
            <div class="mt-4 flex items-center gap-3">
              <UiButton variant="outline" as-child>
                <NuxtLink to="/">
                  &larr; {{ $t('game.returnBtn') }}
                </NuxtLink>
              </UiButton>
              <UiButton variant="outline" @click="loadAchievements">
                {{ $t('game.retryBtn') }}
              </UiButton>
            </div>
          </div>
        </div>
      </section>

    </main>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import type { SteamAchievement, GameAchievementsResponse } from '../../types'

const route = useRoute()
const appid = route.params.id as string
const { locale } = useI18n()

// Game stats
const gameName = ref('Loading Game...')
const achievements = ref<SteamAchievement[]>([])
const unlockedCount = ref(0)
const totalCount = ref(0)
const unlockedPercent = ref(0)

// System states
const isLoading = ref(true)
const error = ref('')
const searchQuery = ref('')
const filterBy = ref<'all' | 'unlocked' | 'locked'>('all')

// Next locked achievements sorted by global unlock percentage
const nextAchievements = computed(() => {
  const locked = achievements.value.filter(a => !a.achieved)
  // Sort by global_percent descending
  locked.sort((a, b) => (b.global_percent || 0) - (a.global_percent || 0))
  return locked.slice(0, 3)
})

// Theme variables
const colorMode = useColorMode()
const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

// Compute standard Game capsule header
const headerImgUrl = computed(() => {
  return `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appid}/header.jpg`
})

onMounted(() => {

  const savedLang = localStorage.getItem('steam_language') || 'uk'
  locale.value = savedLang === 'ukrainian' ? 'uk' : (savedLang === 'english' ? 'en' : (savedLang === 'russian' ? 'ru' : savedLang))
  loadAchievements()
})

function handleLangChange() {
  localStorage.setItem('steam_language', locale.value)
  loadAchievements()
}

async function loadAchievements() {
  isLoading.value = true
  error.value = ''
  
  // Read credentials and language from localStorage
  const apiKey = localStorage.getItem('steam_api_key') || ''
  const steamId = localStorage.getItem('steam_id') || ''
  const lang = locale.value;
  
  try {
    const params = new URLSearchParams()
    params.append('appid', appid)
    if (apiKey.trim()) params.append('apiKey', apiKey.trim())
    if (steamId.trim()) params.append('steamId', steamId.trim())
    params.append('lang', lang)
    
    const response = await $fetch<GameAchievementsResponse>(`/api/steam/achievements?${params.toString()}`)
    
    if (response.success) {
      gameName.value = response.gameName || 'Steam Game'
      achievements.value = response.achievements || []
      totalCount.value = response.total_count || 0
      unlockedCount.value = response.unlocked_count || 0
      unlockedPercent.value = response.unlocked_percent || 0
      
      // If success but no achievements list at all
      if (totalCount.value === 0) {
        error.value = 'This game does not support Steam achievements or stats.'
      }
    } else {
      error.value = response.error || 'Failed to retrieve achievements.'
    }
  } catch (err: any) {
    console.error('Error fetching achievements page data:', err)
    error.value = err.data?.error || err.data?.message || err.message || 'An unexpected error occurred.'
  } finally {
    isLoading.value = false
  }
}

function handleImageError(event: Event) {
  const target = event.target as HTMLImageElement
  if (target) {
    target.src = 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=460&h=215'
  }
}

function handleIconError(event: Event) {
  const target = event.target as HTMLImageElement
  if (target) {
    target.src = 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/252490/achievements/default.jpg'
  }
}

const filteredAchievements = computed(() => {
  let list = [...achievements.value]
  
  // Filter by achievement type
  if (filterBy.value === 'unlocked') {
    list = list.filter(a => a.achieved)
  } else if (filterBy.value === 'locked') {
    list = list.filter(a => !a.achieved)
  }
  
  // Search query filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(a => 
      a.name.toLowerCase().includes(q) || 
      a.description.toLowerCase().includes(q)
    )
  }
  
  return list
})
</script>

<style scoped>
/* Custom scrollbar reset */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.ach-card {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease, box-shadow 0.25s ease, opacity 0.25s ease;
}

.ach-card-img {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
