<template>
  <div class="relative min-h-screen bg-background text-foreground transition-colors duration-300 overflow-x-hidden font-sans pb-16 selection:bg-cyan-500/30 selection:text-cyan-200 dark:bg-[radial-gradient(circle_at_20%_-20%,rgba(6,182,212,0.08),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.06),transparent_50%)] bg-[radial-gradient(circle_at_20%_-20%,rgba(6,182,212,0.04),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.03),transparent_50%)]">
    
    <!-- Main Container -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      
      <!-- Top Navigation & Header -->
      <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8 mb-8 border-b border-border/60">
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-xl bg-card border border-border shadow-xs">
            <!-- Gamepad SVG Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="6" y1="12" x2="10" y2="12"></line>
              <line x1="8" y1="10" x2="8" y2="14"></line>
              <line x1="15" y1="13" x2="15.01" y2="13"></line>
              <line x1="18" y1="11" x2="18.01" y2="11"></line>
              <rect x="2" y="6" width="20" h="12" rx="3"></rect>
            </svg>
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r dark:from-neutral-50 dark:via-neutral-100 dark:to-neutral-400 from-neutral-900 via-neutral-800 to-neutral-600">
              Steam Library Space
            </h1>
            <p class="text-xs sm:text-sm text-muted-foreground font-medium">Your personalized gameplay analytics dashboard</p>
          </div>
        </div>

        <div class="flex items-center gap-3 self-end sm:self-auto">
          <!-- Language Selector dropdown (shadcn select) -->
          <UiSelect v-model="selectedLang" @update:modelValue="handleLangChange">
            <UiSelectTrigger >
              <UiSelectValue placeholder="Language" />
            </UiSelectTrigger>
            <UiSelectContent >
              <UiSelectItem value="ukrainian">UA</UiSelectItem>
              <UiSelectItem value="english">EN</UiSelectItem>
              <UiSelectItem value="russian">RU</UiSelectItem>
            </UiSelectContent>
          </UiSelect>

          <!-- Theme Toggle Button -->
          <UiButton
            variant="outline"
            size="icon"
            @click="toggleTheme"
            title="Toggle theme"
          >
            <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="4"></circle>
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
            </svg>
          </UiButton>

          <!-- Refresh Button -->
          <UiButton 
            v-if="games.length > 0"
            variant="outline"
            size="icon"
            @click="fetchGames" 
            :disabled="isLoading"
            class="group"
            title="Refresh library"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 transition-transform duration-75 group-hover:rotate-180" :class="{'animate-spin': isLoading}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
            </svg>
          </UiButton>

          <!-- Settings Config Button -->
          <UiButton 
            variant="outline"
            @click="showSettings = !showSettings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span>Config</span>
          </UiButton>
        </div>
      </header>

      <!-- Global Stats Summary (Show only when games loaded) -->
      <section v-if="games.length > 0 && !showSettings" class="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8 animate-fade-in">
        <!-- Stat Card 1: Total Games -->
        <UiCard class="relative overflow-hidden">
          <UiCardContent>
            <div class="absolute -right-4 -bottom-4 opacity-10 text-cyan-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-24 h-24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="6" width="20" h="12" rx="3"></rect>
              </svg>
            </div>
            <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Games Played</p>
            <p class="text-3xl font-extrabold mt-2 tracking-tight">{{ totalCount }}</p>
            <p class="text-xs text-muted-foreground/85 mt-1">Games with recorded playtime</p>
          </UiCardContent>
        </UiCard>

        <!-- Stat Card 2: Total Time -->
        <UiCard class="relative overflow-hidden">
          <UiCardContent>
            <div class="absolute -right-4 -bottom-4 opacity-10 text-violet-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-24 h-24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Playtime</p>
            <p class="text-3xl font-extrabold mt-2 tracking-tight">{{ formatHours(totalHours) }} <span class="text-sm font-semibold text-muted-foreground">hrs</span></p>
            <p class="text-xs text-muted-foreground/85 mt-1">Combined time in game space</p>
          </UiCardContent>
        </UiCard>

        <!-- Stat Card 3: Most Played -->
        <UiCard class="relative overflow-hidden">
          <UiCardContent>
            <div class="absolute -right-4 -bottom-4 opacity-10 text-indigo-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-24 h-24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
            <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Most Played Game</p>
            <p class="text-xl font-extrabold mt-2 truncate pr-16 tracking-tight">{{ mostPlayedGame?.name || 'None' }}</p>
            <p class="text-xs mt-1 font-semibold text-indigo-400">{{ mostPlayedGame ? formatHours(mostPlayedGame.playtime_hours) + ' hrs' : '0 hrs' }}</p>
          </UiCardContent>
        </UiCard>
      </section>

      <!-- The Backlog Fighter Widget -->
      <section v-if="games.length > 0 && !showSettings" class="mb-8 animate-fade-in">
        <UiCard>
          <UiCardContent class="p-6 space-y-5">
            <div class="flex items-center justify-between pb-3 border-b border-border">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <!-- Crossed Swords / Roulette SVG icon -->
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"></polyline>
                    <line x1="13" y1="19" x2="22" y2="19"></line>
                    <line x1="19" y1="13" x2="19" y2="22"></line>
                    <polyline points="16 5 21 10 21 3 16 3"></polyline>
                  </svg>
                </div>
                <div>
                  <h3 class="text-base font-bold text-foreground leading-none">{{ rTrans.title }}</h3>
                  <p class="text-xs text-muted-foreground mt-1">{{ rTrans.desc }}</p>
                </div>
              </div>
              
              <!-- Toggle Button to hide/show -->
              <UiButton 
                variant="ghost" 
                size="sm"
                @click="showRoulette = !showRoulette"
                class="text-xs h-8"
              >
                {{ showRoulette ? (selectedLang === 'ukrainian' ? 'Сховати' : selectedLang === 'russian' ? 'Скрыть' : 'Hide') : (selectedLang === 'ukrainian' ? 'Показати' : selectedLang === 'russian' ? 'Показать' : 'Show') }}
              </UiButton>
            </div>

            <div v-if="showRoulette" class="space-y-5 animate-fade-in">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Available Time -->
                <div class="space-y-2">
                  <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{{ rTrans.timeLabel }}</span>
                  <UiTabs v-model="selectedTime" class="w-full">
                    <UiTabsList class="flex w-full max-w-md">
                      <UiTabsTrigger 
                        v-for="tOpt in timeOptions" 
                        :key="tOpt.value" 
                        :value="tOpt.value"
                        class="flex-1 text-xs sm:text-sm"
                      >
                        {{ tOpt.label[selectedLang] }}
                      </UiTabsTrigger>
                    </UiTabsList>
                  </UiTabs>
                </div>

                <!-- Mood -->
                <div class="space-y-2">
                  <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{{ rTrans.moodLabel }}</span>
                  <UiTabs v-model="selectedMood" class="w-full">
                    <UiTabsList class="flex w-full max-w-xl">
                      <UiTabsTrigger 
                        v-for="mOpt in moodOptions" 
                        :key="mOpt.value" 
                        :value="mOpt.value"
                        class="flex-1 text-xs sm:text-sm"
                      >
                        {{ mOpt.label[selectedLang] }}
                      </UiTabsTrigger>
                    </UiTabsList>
                  </UiTabs>
                </div>
              </div>

              <!-- Submit action -->
              <div class="flex justify-center pt-2">
                <UiButton 
                  @click="generateRecommendation" 
                  :disabled="isRecommending"
                  class="w-full md:w-auto px-8 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold transition-all shadow-md shadow-cyan-500/10"
                >
                  <svg v-if="isRecommending" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
                  </svg>
                  <span>{{ rTrans.fightBtn }}</span>
                </UiButton>
              </div>

              <!-- Error in recommendation -->
              <div v-if="recommendationError" class="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive-foreground text-xs">
                {{ recommendationError }}
              </div>

              <!-- Recommendations results grid -->
              <div v-if="recommendations.length > 0" class="pt-4 border-t border-border animate-fade-in">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <UiCard v-for="rec in recommendations" :key="rec.appid" class="relative overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow group">
                    <!-- Game Capsule Banner -->
                    <div class="relative aspect-[460/215] overflow-hidden shrink-0 bg-neutral-950">
                      <img 
                        :src="rec.header_img" 
                        :alt="rec.name"
                        class="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        @error="handleImageError"
                      />
                      <div class="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent opacity-60"></div>
                    </div>

                    <!-- Recommendation details -->
                    <UiCardContent class="p-4 flex-1 flex flex-col justify-between gap-3">
                      <div>
                        <h4 class="font-bold text-sm text-foreground truncate">{{ rec.name }}</h4>
                        <p class="text-[10px] text-cyan-500 dark:text-cyan-400 font-semibold uppercase tracking-wider mt-1">{{ rec.reason }}</p>
                        
                        <div class="flex items-center gap-1.5 mt-2 text-[11px] text-muted-foreground font-medium">
                          <span>{{ rTrans.played }}: <span class="text-foreground font-semibold">{{ rec.playtime_forever > 0 ? formatHours(rec.playtime_hours) + ' ' + rTrans.hrs : rTrans.never }}</span></span>
                        </div>
                        
                        <!-- Genres tags -->
                        <div class="flex flex-wrap gap-1 mt-2.5">
                          <span v-for="g in rec.genres?.slice(0, 2)" :key="g" class="text-[9px] bg-muted px-2 py-0.5 rounded-md font-medium text-muted-foreground">{{ g }}</span>
                        </div>
                      </div>

                      <!-- Direct actions -->
                      <div class="flex items-center gap-2 pt-2 border-t border-border">
                        <UiButton as-child variant="outline" size="sm" class="flex-1 text-[11px] h-8 rounded-lg">
                          <NuxtLink :to="'/game/' + rec.appid">
                            Achievements
                          </NuxtLink>
                        </UiButton>
                        <UiButton as-child size="sm" class="flex-1 text-[11px] h-8 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold border-cyan-500">
                          <a :href="'steam://run/' + rec.appid">
                            Play
                          </a>
                        </UiButton>
                      </div>
                    </UiCardContent>
                  </UiCard>
                </div>
              </div>
            </div>
          </UiCardContent>
        </UiCard>
      </section>

      <!-- Settings Configuration Panel -->
      <section v-if="showSettings" class="max-w-2xl mx-auto mb-8 animate-fade-in">
        <UiCard>
          <UiCardHeader>
            <div class="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <div>
                <UiCardTitle class="text-lg font-bold">Steam API Credentials</UiCardTitle>
                <UiCardDescription class="text-xs text-neutral-400 mt-0.5">Credentials are stored locally in your browser and used only to query Steam.</UiCardDescription>
              </div>
            </div>
          </UiCardHeader>

          <UiCardContent>
            <form @submit.prevent="saveSettings" class="space-y-5">
              <div>
                <label for="apiKey" class="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Steam Web API Key</label>
                <UiInput 
                  type="password" 
                  id="apiKey" 
                  v-model="apiKey"
                  placeholder="Paste your Steam Web API Key" 
                />
                <p class="mt-1.5 text-xs text-neutral-500 leading-normal">
                  You can obtain a key for free from the official page: 
                  <a href="https://steamcommunity.com/dev/apikey" target="_blank" class="text-cyan-400 hover:underline transition-colors font-medium">Steam Dev API Key</a>.
                </p>
              </div>

              <div>
                <label for="steamId" class="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Steam 64-bit ID</label>
                <UiInput 
                  type="text" 
                  id="steamId" 
                  v-model="steamId"
                  placeholder="Example: 76561198034567890" 
                />
                <p class="mt-1.5 text-xs text-neutral-500 leading-normal">
                  This is a 17-digit numeric code. You can find yours by searching your username at websites like 
                  <a href="https://steamid.io" target="_blank" class="text-cyan-400 hover:underline transition-colors font-medium">steamid.io</a> 
                  or checking your Steam Profile URL.
                </p>
              </div>

              <!-- Display Language inside Config Modal -->
              <div>
                <label for="steamLanguage" class="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Display Language / Мова відображення</label>
                <UiSelect v-model="selectedLang" @update:modelValue="handleLangChange">
                  <UiSelectTrigger>
                    <UiSelectValue placeholder="Choose Language" />
                  </UiSelectTrigger>
                  <UiSelectContent>
                    <UiSelectItem value="ukrainian">Українська (Ukrainian)</UiSelectItem>
                    <UiSelectItem value="english">English</UiSelectItem>
                    <UiSelectItem value="russian">Русский (Russian)</UiSelectItem>
                  </UiSelectContent>
                </UiSelect>
              </div>

              <!-- Server Config Info -->
              <div v-if="loadedFromEnv" class="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-start gap-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
                <div>
                  <span class="font-bold">Active Configuration:</span> Currently loading your library automatically using key & ID from the server-side env variables (`.env`). Entering keys above will temporarily override the server defaults.
                </div>
              </div>

              <div class="flex items-center gap-3 pt-2">
                <UiButton 
                  type="submit" 
                  :disabled="isLoading"
                  class="flex-1"
                >
                  <svg v-if="isLoading" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
                  </svg>
                  <span>{{ isLoading ? 'Loading...' : 'Save & Load Library' }}</span>
                </UiButton>
                
                <UiButton 
                  v-if="hasSavedCredentials"
                  type="button" 
                  variant="destructive"
                  @click="clearSettings"
                >
                  Reset
                </UiButton>
              </div>
            </form>
          </UiCardContent>
        </UiCard>
      </section>

      <!-- Main Controls and Grid -->
      <section v-if="!showSettings" class="space-y-6 animate-fade-in">
        
        <!-- Controls: Search & Sort Tabs -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border">
          
          <!-- Search Bar -->
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
              placeholder="Search games..." 
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

          <!-- Sorting Tabs Selector (shadcn tabs) -->
          <div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-2 shrink-0">Sort By:</span>
            <UiTabs v-model="sortBy" class="w-auto">
              <UiTabsList>
                <UiTabsTrigger value="lastPlayed">Last Played</UiTabsTrigger>
                <UiTabsTrigger value="playtimeDesc">Most Played</UiTabsTrigger>
                <UiTabsTrigger value="playtimeAsc">Least Played</UiTabsTrigger>
                <UiTabsTrigger value="name">Name A-Z</UiTabsTrigger>
              </UiTabsList>
            </UiTabs>
          </div>
        </div>

        <!-- Error Alert -->
        <div v-if="error" class="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive-foreground text-sm flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-destructive shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <div class="flex-1">
            <span class="font-bold">Error loading library:</span> {{ error }}
            <UiButton variant="link" @click="showSettings = true" class="p-0 h-auto text-xs font-bold block mt-2 text-cyan-400 hover:text-cyan-300">
              Configure Settings &rarr;
            </UiButton>
          </div>
        </div>

        <!-- Loading Skeleton Grid -->
        <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <UiCard v-for="i in 8" :key="i" class="flex flex-col h-full">
            <UiSkeleton class="aspect-[460/215] w-full" />
            <UiCardContent class="space-y-3 flex-1">
              <UiSkeleton class="h-5 w-3/4" />
              <div class="space-y-2 pt-1">
                <UiSkeleton class="h-3.5 w-1/2" />
                <UiSkeleton class="h-3.5 w-1/3" />
              </div>
            </UiCardContent>
          </UiCard>
        </div>

        <!-- Games Grid (Loaded State) -->
        <div v-else-if="filteredAndSortedGames.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          
          <!-- Game Card (shadcn Card) -->
          <UiCard 
            v-for="game in filteredAndSortedGames" 
            :key="game.appid"
            class="group flex flex-col h-full game-card hover:-translate-y-1 relative"
          >
            <!-- Game Capsule Banner -->
            <div class="relative aspect-[460/215] overflow-hidden shrink-0">
              <img 
                :src="game.header_img" 
                :alt="game.name" 
                loading="lazy"
                class="w-full h-full object-cover game-card-img group-hover:scale-[1.03]"
                @error="handleImageError"
              />
              
              <!-- Subtle top gradient overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent opacity-60"></div>
              
              <!-- App ID Badge (shadcn Badge) -->
              <UiBadge variant="secondary" class="absolute top-2.5 right-2.5">
                ID: {{ game.appid }}
              </UiBadge>

              <!-- Hover Actions overlay -->
              <div class="absolute inset-0 bg-neutral-950/85 opacity-0 group-hover:opacity-100 transition-opacity duration-100 flex flex-col items-center justify-center gap-3">
                <UiButton as-child class="w-[80%]">
                  <a :href="'steam://run/' + game.appid">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 fill-current mr-2" viewBox="0 0 24 24">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    <span>Play Game</span>
                  </a>
                </UiButton>
                
                <UiButton as-child variant="outline" class="w-[80%]">
                  <NuxtLink :to="'/game/' + game.appid">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    <span>Achievements</span>
                  </NuxtLink>
                </UiButton>
              </div>
            </div>

            <!-- Game Details -->
            <UiCardContent class="flex flex-col flex-1 justify-between gap-4">
              <div>
                <h3 class="font-bold text-sm sm:text-base text-foreground group-hover:text-cyan-500 dark:group-hover:text-cyan-300 line-clamp-1 transition-colors tracking-tight">
                  {{ game.name }}
                </h3>
                
                <div class="flex items-center gap-1.5 mt-2.5 text-xs text-muted-foreground font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span>Last launched: <span class="text-foreground font-semibold">{{ game.last_played_relative }}</span></span>
                </div>
              </div>

              <!-- Playtime Stats -->
              <div class="flex items-center justify-between pt-3 border-t border-border">
                <div class="flex flex-col">
                  <span class="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Total Playtime</span>
                  <span class="text-xs font-extrabold text-foreground mt-0.5">
                    {{ formatHours(game.playtime_hours) }} <span class="text-[10px] font-medium text-muted-foreground">hrs</span>
                  </span>
                </div>
                
                <!-- If played recently -->
                <div v-if="game.playtime_2weeks && game.playtime_2weeks > 0" class="flex flex-col items-end">
                  <span class="text-[10px] text-cyan-500 uppercase tracking-wider font-semibold">Recent</span>
                  <span class="text-xs font-bold text-cyan-400 mt-0.5">
                    +{{ Math.round((game.playtime_2weeks / 60) * 10) / 10 }} hrs
                  </span>
                </div>
              </div>
            </UiCardContent>
          </UiCard>

        </div>

        <!-- Empty Results Page -->
        <UiCard v-else class="max-w-md mx-auto text-center">
          <UiCardContent>
            <div class="w-16 h-16 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <h3 class="font-bold text-base">No games match search</h3>
            <p class="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">Try refining your search keyword or clearing the search box.</p>
            <UiButton 
              variant="outline" 
              @click="searchQuery = ''" 
              class="mt-5"
            >
              Clear Search
            </UiButton>
          </UiCardContent>
        </UiCard>

      </section>

    </main>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useDark } from '@vueuse/core'
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

// Theme variables
const isDark = ref(true)
let toggleTheme = () => {}

// Roulette / Backlog Fighter variables
const showRoulette = ref(true)
const selectedTime = ref('2-5')
const selectedMood = ref('story')
const isRecommending = ref(false)
const recommendations = ref<any[]>([])
const recommendationError = ref('')

const timeOptions = [
  { value: '1-2', label: { ukrainian: '🕐 До 2 годин', english: '🕐 Up to 2 hours', russian: '🕐 До 2 часов' } },
  { value: '2-5', label: { ukrainian: '🕒 2-5 годин', english: '🕒 2-5 hours', russian: '🕒 2-5 часов' } },
  { value: '5+', label: { ukrainian: '🌌 5+ годин', english: '🌌 5+ hours', russian: '🌌 5+ часов' } }
]

const moodOptions = [
  { value: 'story', label: { ukrainian: '📖 Сюжетна гра', english: '📖 Story-driven', russian: '📖 Сюжетная игра' } },
  { value: 'challenge', label: { ukrainian: '⚔️ Виклик / Хардкор', english: '⚔️ Challenge', russian: '⚔️ Вызов / Хардкор' } },
  { value: 'casual', label: { ukrainian: '🍹 Сесійна / Казуальна', english: '🍹 Session / Casual', russian: '🍹 Сессионная / Казуальная' } }
]

const rouletteTranslations = {
  ukrainian: {
    title: '⚔️ Борець з беклогом (Анти-Беклог Рулетка)',
    desc: 'Оберіть вільний час та настрій, і ми підберемо 3 гри з вашого беклогу, які ідеально підходять на цей вечір!',
    timeLabel: 'Вільний час:',
    moodLabel: 'Бажаний настрій:',
    fightBtn: 'Знищити беклог! 🎲',
    played: 'Ви награли',
    hrs: 'год',
    never: 'Ще не запускали'
  },
  english: {
    title: '⚔️ Backlog Fighter (Anti-Backlog Roulette)',
    desc: 'Choose your free time and mood, and we will pick 3 games from your backlog that are perfect for this evening!',
    timeLabel: 'Available time:',
    moodLabel: 'Desired mood:',
    fightBtn: 'Fight Backlog! 🎲',
    played: 'Played',
    hrs: 'hrs',
    never: 'Never played'
  },
  russian: {
    title: '⚔️ Борец с бэклогом (Анти-Бэклог Рулетка)',
    desc: 'Выберите свободное время и настроение, и мы подберем 3 игры из вашего бэклога, которые идеально подойдут на этот вечер!',
    timeLabel: 'Свободное время:',
    moodLabel: 'Желаемое настроение:',
    fightBtn: 'Уничтожить бэклог! 🎲',
    played: 'Вы наиграли',
    hrs: 'ч',
    never: 'Еще не запускали'
  }
}

const rTrans = computed(() => {
  return rouletteTranslations[selectedLang.value as 'ukrainian' | 'english' | 'russian'] || rouletteTranslations.ukrainian
})

async function generateRecommendation() {
  isRecommending.value = true
  recommendationError.value = ''
  recommendations.value = []
  
  try {
    const params = new URLSearchParams()
    if (apiKey.value.trim()) params.append('apiKey', apiKey.value.trim())
    if (steamId.value.trim()) params.append('steamId', steamId.value.trim())
    params.append('lang', selectedLang.value)
    params.append('time', selectedTime.value)
    params.append('mood', selectedMood.value)
    
    const response = await $fetch<any>(`/api/steam/recommend?${params.toString()}`)
    if (response.success && response.recommendations) {
      recommendations.value = response.recommendations
      if (recommendations.value.length === 0) {
        recommendationError.value = selectedLang.value === 'ukrainian' 
          ? 'Не знайдено ігор у беклозі під цей настрій. Спробуйте змінити фільтри!' 
          : selectedLang.value === 'russian'
            ? 'Не найдено игр в бэклоге под это настроение. Попробуйте изменить фильтры!'
            : 'No games found in your backlog for this mood. Try changing filters!'
      }
    } else {
      recommendationError.value = response.error || 'Failed to generate recommendations.'
    }
  } catch (err: any) {
    console.error('Error in Backlog Fighter:', err)
    recommendationError.value = err.data?.error || err.message || 'An unexpected error occurred.'
  } finally {
    isRecommending.value = false
  }
}

// Check if user has saved credentials in localStorage
const hasSavedCredentials = computed(() => {
  if (import.meta.client) {
    return !!localStorage.getItem('steam_api_key') && !!localStorage.getItem('steam_id')
  }
  return false
})

onMounted(() => {
  // Bind dark mode
  const darkState = useDark()
  isDark.value = darkState.value
  toggleTheme = () => {
    darkState.value = !darkState.value
    isDark.value = darkState.value
  }

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

.game-card {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease, box-shadow 0.3s ease;
}

.game-card-img {
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
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
