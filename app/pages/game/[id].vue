<template>
  <div class="relative min-h-screen bg-[#08090c] text-neutral-100 overflow-x-hidden font-sans pb-16 selection:bg-cyan-500/30 selection:text-cyan-200">
    <!-- Ambient Background Glows -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div class="absolute top-[-10%] left-[-20%] w-[60vw] h-[60vw] rounded-full bg-cyan-600/10 blur-[120px] animate-pulse" style="animation-duration: 8s;"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-600/10 blur-[120px] animate-pulse" style="animation-duration: 12s;"></div>
      <div class="absolute top-[30%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-indigo-600/5 blur-[100px]"></div>
    </div>

    <!-- Main Container -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      
      <!-- Back Navigation Header -->
      <header class="flex items-center justify-between pb-6 mb-8 border-b border-neutral-800/60">
        <NuxtLink 
          to="/" 
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700/85 text-neutral-300 hover:text-white transition-all duration-300 shadow-md hover:shadow-cyan-500/5 text-sm font-semibold group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>Back to Library</span>
        </NuxtLink>

        <!-- Language Selector -->
        <div class="relative shrink-0">
          <select 
            v-model="selectedLang" 
            @change="handleLangChange"
            class="appearance-none px-4 py-2.5 pr-9 rounded-xl bg-neutral-900/60 border border-neutral-800/80 text-neutral-300 text-sm font-semibold transition-all duration-300 hover:border-neutral-700/80 focus:outline-none cursor-pointer hover:text-white"
          >
            <option value="ukrainian">UA</option>
            <option value="english">EN</option>
            <option value="russian">RU</option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-500">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </header>

      <!-- Loading State (Hero Details) -->
      <section v-if="isLoading" class="p-6 sm:p-8 rounded-2xl bg-neutral-900/30 border border-neutral-800/60 overflow-hidden mb-8 animate-pulse">
        <div class="flex flex-col md:flex-row gap-6 items-center">
          <div class="w-full md:w-[280px] aspect-[460/215] bg-neutral-800/50 rounded-xl"></div>
          <div class="flex-1 space-y-4 w-full">
            <div class="h-8 bg-neutral-800/60 rounded-md w-1/2"></div>
            <div class="h-4 bg-neutral-800/40 rounded-md w-1/4"></div>
            <div class="h-4 bg-neutral-800/40 rounded-md w-3/4 pt-4"></div>
          </div>
        </div>
      </section>

      <!-- Loaded State: Hero Game Info -->
      <section v-else-if="!error" class="relative group rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/80 p-6 sm:p-8 shadow-2xl mb-8 animate-fade-in">
        <div class="flex flex-col md:flex-row gap-6 md:items-center justify-between">
          
          <!-- Banner & Name -->
          <div class="flex flex-col sm:flex-row gap-5 items-center text-center sm:text-left">
            <div class="relative w-[220px] aspect-[460/215] rounded-xl overflow-hidden bg-neutral-950 shadow-lg border border-neutral-800 shrink-0">
              <img 
                :src="headerImgUrl" 
                :alt="gameName"
                class="w-full h-full object-cover"
                @error="handleImageError"
              />
            </div>
            
            <div class="space-y-2">
              <span class="inline-flex px-2.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold uppercase tracking-wider">
                App ID: {{ appid }}
              </span>
              <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                {{ gameName }}
              </h2>
              <div class="flex flex-wrap justify-center sm:justify-start items-center gap-4 pt-1 text-sm text-neutral-400 font-medium">
                <div class="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span>Completion progress: <span class="text-neutral-200 font-semibold">{{ unlockedCount }} / {{ totalCount }}</span></span>
                </div>
              </div>
            </div>
          </div>

          <!-- Progress Ring/Big Metric -->
          <div class="flex flex-col items-center justify-center shrink-0 p-4 rounded-xl bg-neutral-950/40 border border-neutral-800/60 min-w-[140px]">
            <span class="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Unlocked</span>
            <span class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-indigo-400 mt-1 tracking-tight">
              {{ unlockedPercent }}%
            </span>
            <div class="w-full bg-neutral-800/80 rounded-full h-1.5 mt-3 overflow-hidden">
              <div 
                class="bg-gradient-to-r from-cyan-400 to-indigo-500 h-1.5 rounded-full transition-all duration-1000 shadow-md shadow-cyan-400/30"
                :style="{ width: unlockedPercent + '%' }"
              ></div>
            </div>
          </div>

        </div>
      </section>

      <!-- Main Content Block -->
      <section v-if="!isLoading && !error" class="space-y-6 animate-fade-in">
        
        <!-- Filter Controls -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/80 shadow-md">
          
          <!-- Search in Achievements -->
          <div class="relative flex-1 max-w-md">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-neutral-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input 
              type="text" 
              v-model="searchQuery"
              placeholder="Search achievements..." 
              class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all text-sm"
            />
            <button 
              v-if="searchQuery" 
              @click="searchQuery = ''"
              class="absolute inset-y-0 right-0 flex items-center pr-3.5 text-neutral-400 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Tabs: All, Unlocked, Locked -->
          <div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <span class="text-xs font-semibold text-neutral-400 uppercase tracking-wider mr-2 shrink-0">Filter:</span>
            
            <button 
              @click="filterBy = 'all'" 
              class="px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-300 border"
              :class="filterBy === 'all' 
                ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' 
                : 'bg-neutral-950/40 text-neutral-400 border-neutral-800/40 hover:border-neutral-700/60 hover:text-neutral-200'"
            >
              All ({{ totalCount }})
            </button>

            <button 
              @click="filterBy = 'unlocked'" 
              class="px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-300 border"
              :class="filterBy === 'unlocked' 
                ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' 
                : 'bg-neutral-950/40 text-neutral-400 border-neutral-800/40 hover:border-neutral-700/60 hover:text-neutral-200'"
            >
              Unlocked ({{ unlockedCount }})
            </button>

            <button 
              @click="filterBy = 'locked'" 
              class="px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-300 border"
              :class="filterBy === 'locked' 
                ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' 
                : 'bg-neutral-950/40 text-neutral-400 border-neutral-800/40 hover:border-neutral-700/60 hover:text-neutral-200'"
            >
              Locked ({{ totalCount - unlockedCount }})
            </button>
          </div>
        </div>

        <!-- Skeleton Grid while loading list but hero is done (if any async parts) -->
        <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="i in 6" :key="i" class="h-24 rounded-2xl bg-neutral-900/30 border border-neutral-850 p-4 animate-pulse"></div>
        </div>

        <!-- Achievements Grid -->
        <div v-else-if="filteredAchievements.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <!-- Achievement Card -->
          <div 
            v-for="ach in filteredAchievements" 
            :key="ach.apiname"
            class="group flex gap-4 p-4 rounded-2xl transition-all duration-300 border"
            :class="ach.achieved 
              ? 'bg-neutral-900/40 backdrop-blur-xl border-neutral-800/80 hover:border-cyan-500/35 hover:shadow-xl hover:shadow-cyan-500/2' 
              : 'bg-neutral-950/20 border-neutral-900/60 opacity-60 hover:opacity-90'"
          >
            <!-- Icon -->
            <div class="relative w-14 h-14 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 shrink-0">
              <img 
                :src="ach.achieved ? ach.icon : ach.icongray" 
                :alt="ach.name"
                loading="lazy"
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                @error="handleIconError"
              />
              <!-- Unlocked Border Glow -->
              <div v-if="ach.achieved" class="absolute inset-0 border border-cyan-400/20 rounded-xl pointer-events-none"></div>
            </div>

            <!-- Text details -->
            <div class="flex flex-col justify-center min-w-0 flex-1">
              <div class="flex items-start justify-between gap-2">
                <h4 class="font-bold text-sm sm:text-base text-neutral-100 group-hover:text-cyan-300 transition-colors truncate">
                  {{ ach.name }}
                </h4>
                
                <!-- Achieved badge -->
                <span 
                  v-if="ach.achieved" 
                  class="shrink-0 px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-bold tracking-wider uppercase border border-cyan-500/20"
                >
                  Unlocked
                </span>
              </div>
              
              <!-- Description -->
              <p class="text-xs text-neutral-400 line-clamp-2 mt-1 leading-normal pr-4">
                {{ ach.description || 'No description provided.' }}
              </p>

              <!-- Unlock relative time -->
              <p v-if="ach.achieved" class="text-[10px] text-neutral-500 mt-1.5 font-medium flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-neutral-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Unlocked {{ ach.unlocktime_relative }}</span>
              </p>
            </div>
          </div>

        </div>

        <!-- Empty Grid/Search -->
        <div v-else class="text-center py-16 px-4 rounded-2xl bg-neutral-900/20 border border-neutral-800/60 max-w-md mx-auto">
          <div class="w-16 h-16 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h3 class="font-bold text-base text-neutral-200">No achievements found</h3>
          <p class="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
            {{ searchQuery ? 'Try clearing your search term.' : 'This game doesn\'t seem to have achievements matching the selected filter.' }}
          </p>
        </div>

      </section>

      <!-- Global Error Alert / Back Action -->
      <section v-if="error" class="max-w-2xl mx-auto py-8">
        <div class="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-start gap-4 shadow-lg shadow-red-500/2">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-red-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <div class="flex-1">
            <h3 class="font-extrabold text-base text-red-400 mb-1">Failed to load achievements</h3>
            <p class="leading-relaxed text-neutral-300">{{ error }}</p>
            <div class="mt-4 flex items-center gap-3">
              <NuxtLink to="/" class="px-4 py-2 rounded-xl bg-neutral-800 text-xs font-semibold hover:bg-neutral-700 text-white transition-all duration-300">
                &larr; Return to Library
              </NuxtLink>
              <button @click="loadAchievements" class="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold transition-all duration-300">
                Retry
              </button>
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
const selectedLang = ref('ukrainian')

// Compute standard Game capsule header
const headerImgUrl = computed(() => {
  return `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appid}/header.jpg`
})

onMounted(() => {
  selectedLang.value = localStorage.getItem('steam_language') || 'ukrainian'
  loadAchievements()
})

function handleLangChange() {
  localStorage.setItem('steam_language', selectedLang.value)
  loadAchievements()
}

async function loadAchievements() {
  isLoading.value = true
  error.value = ''
  
  // Read credentials and language from localStorage
  const apiKey = localStorage.getItem('steam_api_key') || ''
  const steamId = localStorage.getItem('steam_id') || ''
  const lang = selectedLang.value;
  
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

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
