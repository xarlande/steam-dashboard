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
      
      <!-- Top Navigation & Header -->
      <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8 mb-8 border-b border-neutral-800/60">
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 shadow-lg shadow-cyan-500/5">
            <!-- Custom Gamepad SVG Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-cyan-400 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="6" y1="12" x2="10" y2="12"></line>
              <line x1="8" y1="10" x2="8" y2="14"></line>
              <line x1="15" y1="13" x2="15.01" y2="13"></line>
              <line x1="18" y1="11" x2="18.01" y2="11"></line>
              <rect x="2" y="6" width="20" h="12" rx="3"></rect>
            </svg>
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-50 via-neutral-100 to-neutral-400">
              Steam Library Space
            </h1>
            <p class="text-xs sm:text-sm text-neutral-400 font-medium">Your personalized gameplay analytics dashboard</p>
          </div>
        </div>

        <div class="flex items-center gap-3 self-end sm:self-auto">
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

          <!-- Refresh Button (Only if config exists) -->
          <button 
            v-if="games.length > 0"
            @click="fetchGames" 
            :disabled="isLoading"
            class="flex items-center justify-center p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700/80 text-neutral-300 hover:text-white transition-all duration-300 disabled:opacity-50 group hover:shadow-lg hover:shadow-cyan-500/5"
            title="Refresh library"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 transition-transform duration-700 group-hover:rotate-180" :class="{'animate-spin': isLoading}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
            </svg>
          </button>

          <!-- Settings Button -->
          <button 
            @click="showSettings = !showSettings"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border"
            :class="showSettings 
              ? 'bg-neutral-800 text-white border-neutral-700' 
              : 'bg-neutral-900/60 text-neutral-300 border-neutral-800/80 hover:border-neutral-700/80 hover:text-white hover:shadow-lg hover:shadow-cyan-500/5'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span>Config</span>
          </button>
        </div>
      </header>

      <!-- Global Stats Summary (Show only when games loaded) -->
      <section v-if="games.length > 0 && !showSettings" class="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8 animate-fade-in">
        <!-- Stat Card 1: Total Games -->
        <div class="relative group overflow-hidden rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/80 p-5 transition-all duration-300 hover:border-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/2">
          <div class="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-300 text-cyan-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-24 h-24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="6" width="20" h="12" rx="3"></rect>
            </svg>
          </div>
          <p class="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Total Games Played</p>
          <p class="text-3xl font-extrabold text-neutral-50 mt-2 tracking-tight">{{ totalCount }}</p>
          <p class="text-xs text-neutral-500 mt-1">Games with recorded playtime</p>
        </div>

        <!-- Stat Card 2: Total Time -->
        <div class="relative group overflow-hidden rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/80 p-5 transition-all duration-300 hover:border-violet-500/30 hover:shadow-xl hover:shadow-violet-500/2">
          <div class="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-300 text-violet-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-24 h-24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <p class="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Total Playtime</p>
          <p class="text-3xl font-extrabold text-neutral-50 mt-2 tracking-tight">{{ formatHours(totalHours) }} <span class="text-sm font-semibold text-neutral-400">hrs</span></p>
          <p class="text-xs text-neutral-500 mt-1">Combined time in game space</p>
        </div>

        <!-- Stat Card 3: Most Played -->
        <div class="relative group overflow-hidden rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/80 p-5 transition-all duration-300 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/2">
          <div class="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-300 text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-24 h-24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </div>
          <p class="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Most Played Game</p>
          <p class="text-xl font-extrabold text-neutral-50 mt-2 truncate pr-16 tracking-tight">{{ mostPlayedGame?.name || 'None' }}</p>
          <p class="text-xs text-neutral-400 mt-1 font-semibold text-indigo-400">{{ mostPlayedGame ? formatHours(mostPlayedGame.playtime_hours) + ' hrs' : '0 hrs' }}</p>
        </div>
      </section>

      <!-- Settings Configuration Panel -->
      <section v-if="showSettings" class="max-w-2xl mx-auto mb-8 animate-fade-in">
        <div class="rounded-2xl bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 shadow-2xl p-6 sm:p-8">
          <div class="flex items-center gap-3 pb-4 mb-6 border-b border-neutral-800/80">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <div>
              <h2 class="text-lg font-bold text-neutral-50">Steam API Credentials</h2>
              <p class="text-xs text-neutral-400">Credentials are stored locally in your browser and used only to query Steam.</p>
            </div>
          </div>

          <form @submit.prevent="saveSettings" class="space-y-5">
            <div>
              <label for="apiKey" class="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">Steam Web API Key</label>
              <div class="relative rounded-xl shadow-sm">
                <input 
                  type="password" 
                  id="apiKey" 
                  v-model="apiKey"
                  placeholder="Paste your Steam Web API Key" 
                  class="w-full px-4 py-3 rounded-xl bg-neutral-950/80 border border-neutral-800 text-neutral-200 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all text-sm font-mono"
                />
              </div>
              <p class="mt-1.5 text-xs text-neutral-500 leading-normal">
                You can obtain a key for free from the official page: 
                <a href="https://steamcommunity.com/dev/apikey" target="_blank" class="text-cyan-400 hover:underline transition-colors font-medium">Steam Dev API Key</a>.
              </p>
            </div>

            <div>
              <label for="steamId" class="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">Steam 64-bit ID</label>
              <input 
                type="text" 
                id="steamId" 
                v-model="steamId"
                placeholder="Example: 76561198034567890" 
                class="w-full px-4 py-3 rounded-xl bg-neutral-950/80 border border-neutral-800 text-neutral-200 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all text-sm font-mono"
              />
              <p class="mt-1.5 text-xs text-neutral-500 leading-normal">
                This is a 17-digit numeric code. You can find yours by searching your username at websites like 
                <a href="https://steamid.io" target="_blank" class="text-cyan-400 hover:underline transition-colors font-medium">steamid.io</a> 
                or checking your Steam Profile URL.
              </p>
            </div>

            <div>
              <label for="steamLanguage" class="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">Display Language / Мова відображення</label>
              <select 
                id="steamLanguage" 
                v-model="selectedLang"
                class="w-full px-4 py-3 rounded-xl bg-neutral-950/80 border border-neutral-800 text-neutral-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all text-sm font-medium"
              >
                <option value="ukrainian">Українська (Ukrainian)</option>
                <option value="english">English</option>
                <option value="russian">Русский (Russian)</option>
              </select>
              <p class="mt-1.5 text-xs text-neutral-500 leading-normal">
                Steam will return achievements and names in this language if they are supported by the game developer.
              </p>
            </div>

            <!-- Server Config Info -->
            <div v-if="loadedFromEnv" class="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-start gap-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="m9 12 2 2 4-4"></path>
              </svg>
              <div>
                <span class="font-bold">Active Configuration:</span> Currently loading your library automatically using key & ID from the server-side env variables (`.env`). Entering keys below will temporarily override the server defaults.
              </div>
            </div>

            <div class="flex items-center gap-3 pt-2">
              <button 
                type="submit" 
                :disabled="isLoading"
                class="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-cyan-500/10 hover:shadow-cyan-400/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-50"
              >
                <svg v-if="isLoading" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
                </svg>
                <span>{{ isLoading ? 'Loading...' : 'Save & Load Library' }}</span>
              </button>
              
              <button 
                v-if="hasSavedCredentials"
                type="button" 
                @click="clearSettings"
                class="px-4 py-3 rounded-xl border border-red-500/20 hover:border-red-500/40 text-red-400 hover:bg-red-500/10 font-semibold text-sm transition-all duration-300"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </section>

      <!-- Main Controls and Grid -->
      <section v-if="!showSettings" class="space-y-6">
        
        <!-- Controls: Search & Sort Tabs -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/80 shadow-md">
          
          <!-- Search Bar -->
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
              placeholder="Search games..." 
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

          <!-- Sorting Selector -->
          <div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <span class="text-xs font-semibold text-neutral-400 uppercase tracking-wider mr-2 shrink-0">Sort By:</span>
            
            <button 
              @click="sortBy = 'lastPlayed'" 
              class="px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-300"
              :class="sortBy === 'lastPlayed' 
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' 
                : 'bg-neutral-950/40 text-neutral-400 border border-neutral-800/40 hover:border-neutral-700/60 hover:text-neutral-200'"
            >
              Last Played
            </button>

            <button 
              @click="sortBy = 'playtimeDesc'" 
              class="px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-300"
              :class="sortBy === 'playtimeDesc' 
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' 
                : 'bg-neutral-950/40 text-neutral-400 border border-neutral-800/40 hover:border-neutral-700/60 hover:text-neutral-200'"
            >
              Most Played
            </button>

            <button 
              @click="sortBy = 'playtimeAsc'" 
              class="px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-300"
              :class="sortBy === 'playtimeAsc' 
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' 
                : 'bg-neutral-950/40 text-neutral-400 border border-neutral-800/40 hover:border-neutral-700/60 hover:text-neutral-200'"
            >
              Least Played
            </button>

            <button 
              @click="sortBy = 'name'" 
              class="px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-300"
              :class="sortBy === 'name' 
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' 
                : 'bg-neutral-950/40 text-neutral-400 border border-neutral-800/40 hover:border-neutral-700/60 hover:text-neutral-200'"
            >
              Name A-Z
            </button>
          </div>
        </div>

        <!-- Error Alert -->
        <div v-if="error" class="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-start gap-3 shadow-lg shadow-red-500/2">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <div class="flex-1">
            <span class="font-bold">Error loading library:</span> {{ error }}
            <button @click="showSettings = true" class="block mt-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
              Configure Settings &rarr;
            </button>
          </div>
        </div>

        <!-- Loading Skeleton Grid -->
        <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div v-for="i in 8" :key="i" class="rounded-2xl bg-neutral-900/30 border border-neutral-800/60 overflow-hidden animate-pulse">
            <div class="aspect-[460/215] bg-neutral-800/50"></div>
            <div class="p-4 space-y-3">
              <div class="h-4.5 bg-neutral-800/60 rounded-md w-3/4"></div>
              <div class="space-y-2 pt-1">
                <div class="h-3 bg-neutral-800/40 rounded-md w-1/2"></div>
                <div class="h-3 bg-neutral-800/40 rounded-md w-1/3"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Games Grid (Loaded State) -->
        <div v-else-if="filteredAndSortedGames.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          
          <!-- Game Card -->
          <div 
            v-for="game in filteredAndSortedGames" 
            :key="game.appid"
            class="group relative rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/80 hover:border-cyan-500/40 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-1.5 flex flex-col h-full"
          >
            <!-- Game Capsule Banner -->
            <div class="relative aspect-[460/215] overflow-hidden bg-neutral-950 shrink-0">
              <img 
                :src="game.header_img" 
                :alt="game.name" 
                loading="lazy"
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                @error="handleImageError"
              />
              
              <!-- Subtle top gradient overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent opacity-60"></div>
              
              <!-- App ID Badge -->
              <span class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-neutral-400 border border-neutral-800/50">
                ID: {{ game.appid }}
              </span>

              <!-- Hover Play Launcher / View Achievements Action -->
              <div class="absolute inset-0 bg-neutral-950/85 backdrop-blur-[3px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3">
                <a 
                  :href="'steam://run/' + game.appid"
                  class="flex items-center justify-center gap-2 py-2 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs tracking-wide uppercase transition-all duration-200 transform scale-95 group-hover:scale-100 shadow-md shadow-cyan-500/35 cursor-pointer w-[80%] text-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                  <span>Play Game</span>
                </a>
                
                <NuxtLink 
                  :to="'/game/' + game.appid"
                  class="flex items-center justify-center gap-2 py-2 px-5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-cyan-400 hover:text-cyan-300 font-bold text-xs tracking-wide uppercase transition-all duration-200 transform scale-95 group-hover:scale-100 border border-cyan-500/20 w-[80%] text-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  <span>Achievements</span>
                </NuxtLink>
              </div>
            </div>

            <!-- Game Details -->
            <div class="p-4 flex flex-col flex-1 justify-between gap-4">
              <div>
                <h3 class="font-bold text-sm sm:text-base text-neutral-100 group-hover:text-cyan-300 line-clamp-1 transition-colors tracking-tight">
                  {{ game.name }}
                </h3>
                
                <div class="flex items-center gap-1.5 mt-2.5 text-xs text-neutral-400 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span>Last launched: <span class="text-neutral-300 font-semibold">{{ game.last_played_relative }}</span></span>
                </div>
              </div>

              <!-- Playtime Stats -->
              <div class="flex items-center justify-between pt-3 border-t border-neutral-800/80">
                <div class="flex flex-col">
                  <span class="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Total Playtime</span>
                  <span class="text-xs font-extrabold text-neutral-300 mt-0.5">
                    {{ formatHours(game.playtime_hours) }} <span class="text-[10px] font-medium text-neutral-500">hrs</span>
                  </span>
                </div>
                
                <!-- If played recently (2weeks) -->
                <div v-if="game.playtime_2weeks && game.playtime_2weeks > 0" class="flex flex-col items-end">
                  <span class="text-[10px] text-cyan-500 uppercase tracking-wider font-semibold">Recent</span>
                  <span class="text-xs font-bold text-cyan-400 mt-0.5">
                    +{{ Math.round((game.playtime_2weeks / 60) * 10) / 10 }} hrs
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Empty Results Page -->
        <div v-else class="text-center py-16 px-4 rounded-2xl bg-neutral-900/20 border border-neutral-800/60 max-w-md mx-auto">
          <div class="w-16 h-16 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <h3 class="font-bold text-base text-neutral-200">No games match search</h3>
          <p class="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">Try refining your search keyword or clearing the search box.</p>
          <button 
            @click="searchQuery = ''" 
            class="mt-4 px-4 py-2 rounded-xl bg-neutral-800 text-xs font-semibold hover:bg-neutral-700 hover:text-white transition-all duration-300"
          >
            Clear Search
          </button>
        </div>

      </section>

    </main>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import type { SteamGame, SteamApiResponse } from '../types'

// State variables
const apiKey = ref('')
const steamId = ref('')
const selectedLang = ref('ukrainian')
const games = ref<SteamGame[]>([])
const totalHours = ref(0)
const totalCount = ref(0)
const isLoading = ref(false)
const error = ref('')
const searchQuery = ref('')
const sortBy = ref<'lastPlayed' | 'playtimeDesc' | 'playtimeAsc' | 'name'>('lastPlayed')
const showSettings = ref(false)
const loadedFromEnv = ref(false)

// Check if user has saved credentials in localStorage
const hasSavedCredentials = computed(() => {
  if (import.meta.client) {
    return !!localStorage.getItem('steam_api_key') && !!localStorage.getItem('steam_id')
  }
  return false
})

onMounted(() => {
  // Load credentials if they exist
  apiKey.value = localStorage.getItem('steam_api_key') || ''
  steamId.value = localStorage.getItem('steam_id') || ''
  selectedLang.value = localStorage.getItem('steam_language') || 'ukrainian'
  
  // Fetch games
  fetchGames()
})

async function fetchGames() {
  isLoading.value = true
  error.value = ''
  
  try {
    const params = new URLSearchParams()
    
    // Pass local storage credentials if we have them
    if (apiKey.value.trim()) params.append('apiKey', apiKey.value.trim())
    if (steamId.value.trim()) params.append('steamId', steamId.value.trim())
    params.append('lang', selectedLang.value)
    
    const response = await $fetch<SteamApiResponse>(`/api/steam/games?${params.toString()}`)
    
    if (response.success && response.games) {
      games.value = response.games
      totalHours.value = response.total_playtime_hours || 0
      totalCount.value = response.total_count || 0
      loadedFromEnv.value = !!response.usingEnv
      
      // Save valid local keys to storage if user provided them
      if (apiKey.value.trim() && steamId.value.trim()) {
        localStorage.setItem('steam_api_key', apiKey.value.trim())
        localStorage.setItem('steam_id', steamId.value.trim())
      }
      localStorage.setItem('steam_language', selectedLang.value)
      
      showSettings.value = false
    } else {
      error.value = response.error || 'Failed to fetch games'
      
      // If we failed and don't have local keys, open settings
      if (!apiKey.value.trim() || !steamId.value.trim()) {
        showSettings.value = true
      }
    }
  } catch (err: any) {
    console.error('Error fetching library:', err)
    error.value = err.data?.error || err.data?.message || err.message || 'An unexpected error occurred.'
    showSettings.value = true
  } finally {
    isLoading.value = false
  }
}

function handleLangChange() {
  localStorage.setItem('steam_language', selectedLang.value)
  fetchGames()
}

function saveSettings() {
  error.value = ''
  // Relax validation: allow empty form if already configured in env or localStorage
  if (!loadedFromEnv.value && !hasSavedCredentials.value && (!apiKey.value.trim() || !steamId.value.trim())) {
    error.value = 'Please provide both a Steam API Key and a Steam 64 ID.'
    showSettings.value = true
    return
  }
  localStorage.setItem('steam_language', selectedLang.value)
  fetchGames()
}

function clearSettings() {
  apiKey.value = ''
  steamId.value = ''
  selectedLang.value = 'ukrainian'
  localStorage.removeItem('steam_api_key')
  localStorage.removeItem('steam_id')
  localStorage.removeItem('steam_language')
  games.value = []
  totalHours.value = 0
  totalCount.value = 0
  loadedFromEnv.value = false
  error.value = ''
  showSettings.value = true
}

// Format numbers nicely (e.g. 1,234.5)
function formatHours(hours: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(hours)
}

// Fallback image handler in case Steam banner is missing
function handleImageError(event: Event) {
  const target = event.target as HTMLImageElement
  if (target) {
    target.src = 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=460&h=215'
  }
}

// Compute most played game
const mostPlayedGame = computed(() => {
  if (games.value.length === 0) return null
  return [...games.value].sort((a, b) => b.playtime_forever - a.playtime_forever)[0]
})

// Filter and sort games list
const filteredAndSortedGames = computed(() => {
  let list = [...games.value]
  
  // Apply search query
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(game => game.name.toLowerCase().includes(q))
  }
  
  // Apply sorting rules
  if (sortBy.value === 'lastPlayed') {
    list.sort((a, b) => b.rtime_last_played - a.rtime_last_played)
  } else if (sortBy.value === 'playtimeDesc') {
    list.sort((a, b) => b.playtime_forever - a.playtime_forever)
  } else if (sortBy.value === 'playtimeAsc') {
    list.sort((a, b) => a.playtime_forever - b.playtime_forever)
  } else if (sortBy.value === 'name') {
    list.sort((a, b) => a.name.localeCompare(b.name))
  }
  
  return list
})
</script>

<style scoped>
/* Custom hide scrollbars */
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
