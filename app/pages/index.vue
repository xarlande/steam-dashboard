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

      <!-- Gaming Time Quality Card -->
      <section v-if="games.length > 0 && !showSettings" class="mb-8 animate-fade-in">
        <UiCard :class="detoxCardClass" class="overflow-hidden bg-gradient-to-br from-card to-card/50 transition-all duration-500">
          <UiCardContent class="p-6">
            <!-- Header Row -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/60">
              <div class="flex items-center gap-3">
                <div class="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    <circle cx="12" cy="11" r="3"></circle>
                    <path d="M12 8v6"></path>
                    <path d="M10 12h4"></path>
                  </svg>
                </div>
                <div>
                  <h2 class="text-lg sm:text-xl font-bold tracking-tight text-foreground">{{ t.title }}</h2>
                  <p class="text-xs text-muted-foreground font-medium mt-0.5">{{ t.description }}</p>
                </div>
              </div>
              
              <!-- Status Badge -->
              <div class="self-start sm:self-auto flex items-center gap-2">
                <span class="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{{ t.statusLabel }}:</span>
                <UiBadge :class="hygieneBadgeClass" class="text-xs py-1 px-3 font-bold border rounded-lg transition-all duration-300">
                  {{ t.states[hygieneStatus].title }}
                </UiBadge>
              </div>
            </div>

            <!-- Content Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              
              <!-- Left Column: Advice Box and Progress Scale -->
              <div class="md:col-span-2 flex flex-col justify-between gap-6">
                <!-- Recommendations/Hygienic advice -->
                <div 
                  class="p-4 sm:p-5 rounded-2xl border flex items-start gap-4 transition-all duration-300"
                  :class="adviceBoxClass"
                >
                  <span class="text-3xl shrink-0 select-none">
                    <span v-if="hygieneStatus === 'critical'">🚨</span>
                    <span v-else-if="hygieneStatus === 'poor'">⚠️</span>
                    <span v-else-if="hygieneStatus === 'balanced'">⚖️</span>
                    <span v-else-if="hygieneStatus === 'excellent'">✨</span>
                    <span v-else>🌱</span>
                  </span>
                  <div>
                    <h4 class="font-extrabold text-sm tracking-tight mb-1 uppercase tracking-wide opacity-90">{{ t.tipsTitle }}</h4>
                    <p class="text-sm leading-relaxed font-semibold opacity-95">{{ t.states[hygieneStatus].desc }}</p>
                    
                    <!-- Roulette Trigger Button -->
                    <div v-if="hygieneStatus === 'critical' || hygieneStatus === 'poor'" class="mt-3.5 animate-bounce">
                      <UiButton 
                        size="sm" 
                        class="bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs px-4.5 py-2.5 rounded-xl shadow-lg shadow-rose-900/10 transition-all duration-300 active:scale-95 border-0 flex items-center gap-1.5"
                        @click="startRoulette"
                      >
                        <span>🔮</span>
                        <span>{{ t.rouletteBtn }}</span>
                      </UiButton>
                    </div>
                  </div>
                </div>

                <!-- Progress Bar / Scale -->
                <div class="space-y-3.5">
                  <div class="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                    <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span> 🎮 {{ t.sessionLabel }}</span>
                    <span class="text-foreground text-sm font-black">{{ storyPercentage }}% {{ t.storyLabel }}</span>
                    <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> 🎭 {{ t.storyLabel }}</span>
                  </div>
                  
                  <UiProgress 
                    :model-value="storyPercentage" 
                    class="h-3.5 bg-neutral-200 dark:bg-neutral-800/80 rounded-full overflow-hidden" 
                    :class="'progress-' + hygieneStatus"
                  />
                  
                  <div class="flex items-center justify-between text-[10px] text-muted-foreground/80 font-bold uppercase tracking-wider">
                    <span>100% {{ t.sessionLabel }}</span>
                    <span>50/50 Balance</span>
                    <span>100% {{ t.storyLabel }}</span>
                  </div>
                </div>
              </div>

              <!-- Right Column: Recent Playtime Summary & Toggle -->
              <div class="p-5 rounded-2xl bg-card/30 border border-border/80 flex flex-col justify-between gap-6">
                <div class="space-y-4">
                  <h3 class="text-xs font-bold text-muted-foreground uppercase tracking-widest">{{ t.recentPlaytime }}</h3>
                  
                  <div class="space-y-3">
                    <!-- Total Recent Time -->
                    <div class="flex justify-between items-baseline pb-2.5 border-b border-border/60">
                      <span class="text-sm text-muted-foreground font-semibold">Total</span>
                      <span class="text-2xl font-black text-foreground">{{ formatHours(recentTotalHours) }} <span class="text-xs font-semibold text-muted-foreground">{{ t.hoursSuffix }}</span></span>
                    </div>

                    <!-- Story Hours -->
                    <div class="flex justify-between items-center">
                      <span class="text-xs font-semibold text-muted-foreground">{{ t.storyLabel }}</span>
                      <span class="text-sm font-bold text-cyan-400">{{ formatHours(recentStoryHours) }} {{ t.hoursSuffix }}</span>
                    </div>

                    <!-- Session Hours -->
                    <div class="flex justify-between items-center">
                      <span class="text-xs font-semibold text-muted-foreground">{{ t.sessionLabel }}</span>
                      <span class="text-sm font-bold text-rose-500">{{ formatHours(recentSessionHours) }} {{ t.hoursSuffix }}</span>
                    </div>
                  </div>
                </div>

                <!-- Customizer Toggle Button -->
                <UiButton 
                  v-if="recentlyPlayedGames.length > 0"
                  variant="outline" 
                  size="sm" 
                  class="w-full text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  @click="showCategorizer = !showCategorizer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                  <span>{{ showCategorizer ? 'Hide Categorizer' : 'Customize Categories' }}</span>
                </UiButton>
              </div>
            </div>

            <!-- Game Categorizer (Collapsible Panel) -->
            <transition name="slide-fade">
              <div v-if="showCategorizer && recentlyPlayedGames.length > 0" class="mt-6 pt-6 border-t border-border/60">
                <div class="mb-4">
                  <h3 class="text-sm font-bold text-foreground">{{ t.customizeHeader }}</h3>
                  <p class="text-xs text-muted-foreground font-medium mt-0.5">{{ t.customizeDesc }}</p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div 
                    v-for="game in recentlyPlayedGames" 
                    :key="'cat-' + game.appid"
                    class="flex items-center justify-between p-3 rounded-2xl border border-border bg-card/30 hover:bg-card/50 transition-all"
                  >
                    <div class="flex items-center gap-3 min-w-0 flex-1 pr-2">
                      <!-- Small game banner -->
                      <img 
                        :src="game.header_img" 
                        :alt="game.name"
                        class="w-12 h-6.5 rounded-md object-cover border border-border/40 shrink-0"
                        @error="handleImageError"
                      />
                      
                      <div class="min-w-0">
                        <h4 class="text-xs font-bold text-foreground truncate" :title="game.name">
                          {{ game.name }}
                        </h4>
                        <p class="text-[10px] text-muted-foreground/90 font-semibold mt-0.5">
                          {{ Math.round((game.playtime_2weeks / 60) * 10) / 10 }} {{ t.hoursSuffix }}
                        </p>
                      </div>
                    </div>

                    <!-- Category toggle switch/button -->
                    <UiButton 
                      variant="outline" 
                      size="icon" 
                      class="h-8 w-8 rounded-xl shrink-0 transition-transform active:scale-95"
                      :class="getGameCategory(game) === 'story' ? 'text-cyan-400 bg-cyan-500/5 border-cyan-500/20 hover:text-cyan-300' : 'text-rose-500 bg-rose-500/5 border-rose-500/20 hover:text-rose-400'"
                      :title="getGameCategory(game) === 'story' ? t.storyBtn : t.sessionBtn"
                      @click="toggleGameCategory(game.appid)"
                    >
                      <span class="text-base select-none">
                        <span v-if="getGameCategory(game) === 'story'">🎭</span>
                        <span v-else>🎮</span>
                      </span>
                    </UiButton>
                  </div>
                </div>
              </div>
            </transition>

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

      <!-- Roulette Modal -->
      <div 
        v-if="showRouletteModal" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all duration-300 animate-fade-in"
      >
        <div class="relative w-full max-w-md bg-card border border-border/80 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center overflow-hidden">
          
          <!-- Decorative background glow -->
          <div class="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>
          <div class="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-violet-500/10 blur-3xl pointer-events-none"></div>
          
          <!-- Close button -->
          <button 
            @click="showRouletteModal = false"
            class="absolute top-4 right-4 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <!-- Modal Title -->
          <h3 class="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400 mb-6 flex items-center gap-2">
            <span>🎡</span> {{ t.rouletteTitle }}
          </h3>

          <!-- The Roulette Reel -->
          <div class="relative h-32 w-full overflow-hidden border border-cyan-500/30 rounded-2xl bg-neutral-950/70 shadow-[inset_0_0_24px_rgba(6,182,212,0.15)] mb-6 flex items-center justify-center">
            
            <div 
              class="absolute left-0 right-0 top-0"
              :style="reelStyle"
            >
              <div 
                v-for="(game, index) in reelGames" 
                :key="index"
                class="h-32 flex flex-col items-center justify-center px-4"
              >
                <img 
                  :src="game.header_img" 
                  :alt="game.name"
                  class="w-32 h-15 rounded-lg object-cover border border-border shadow-md"
                  @error="handleImageError"
                />
                <span class="text-sm font-black text-foreground truncate max-w-[260px] mt-2 tracking-tight">{{ game.name }}</span>
              </div>
            </div>

            <!-- Viewport Overlay line markers -->
            <div class="absolute inset-x-0 inset-y-10 border-y border-cyan-500/20 bg-cyan-500/5 pointer-events-none"></div>
            
            <!-- Side shadow overlays to make it look 3D cylindrical -->
            <div class="absolute inset-0 bg-gradient-to-b from-neutral-950/60 via-transparent to-neutral-950/60 pointer-events-none"></div>
          </div>

          <!-- Spinner Status / Results -->
          <div class="w-full space-y-5">
            <div v-if="isSpinning" class="space-y-3">
              <p class="text-xs font-semibold text-muted-foreground uppercase tracking-widest animate-pulse">{{ t.rouletteSpinning }}</p>
              <div class="flex justify-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce"></span>
                <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]"></span>
                <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>

            <div v-else-if="finalSelectedGame" class="animate-fade-in space-y-5">
              <div class="p-4.5 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 text-sm">
                <span class="text-2xl mb-2 block select-none">✨</span>
                <p class="font-bold text-cyan-400 mb-2 leading-snug">{{ t.rouletteLanding }}</p>
                <h4 class="text-lg font-black text-foreground tracking-tight">{{ finalSelectedGame.name }}</h4>
                <p class="text-xs text-muted-foreground font-semibold mt-1">
                  {{ t.roulettePlaytime.replace('{hours}', formatHours(finalSelectedGame.playtime_hours)) }}
                </p>
              </div>

              <!-- Action buttons -->
              <div class="flex flex-col gap-2.5 w-full">
                <UiButton as-child class="w-full py-5 font-bold shadow-lg shadow-cyan-900/10">
                  <a :href="'steam://run/' + finalSelectedGame.appid">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5 fill-current mr-2" viewBox="0 0 24 24">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    <span>{{ t.rouletteLaunch }}</span>
                  </a>
                </UiButton>
                
                <div class="grid grid-cols-2 gap-2.5 w-full">
                  <UiButton as-child variant="outline" size="sm" class="font-semibold">
                    <NuxtLink :to="'/game/' + finalSelectedGame.appid">
                      🏆 {{ t.rouletteAchievements }}
                    </NuxtLink>
                  </UiButton>
                  
                  <UiButton variant="outline" size="sm" class="font-semibold" @click="startRoulette">
                    🔄 {{ t.rouletteAgain }}
                  </UiButton>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

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

// State variables for Gaming Time Quality Feature
const manualCategories = ref<Record<number, 'story' | 'session'>>({})
const showCategorizer = ref(false)

const SESSION_GAME_KEYWORDS = [
  'counter-strike', 'cs:go', 'cs2', 'dota', 'league of legends', 'valorant', 'apex legends',
  'pubg', 'fortnite', 'overwatch', 'war thunder', 'world of tanks', 'world of warships',
  'team fortress', 'rust', 'dayz', 'rainbow six', 'destiny', 'warframe', 'helldivers',
  'gta online', 'dead by daylight', 'rocket league', 'fifa', 'madden', 'nba 2k',
  'street fighter', 'tekken', 'mortal kombat', 'brawlhalla', 'among us', 'phasmophobia',
  'lethal company', 'roblox', 'minecraft', 'payday', 'left 4 dead', 'killing floor',
  'deep rock galactic', 'hearthstone', 'magic: the gathering', 'yu-gi-oh', 'tft',
  'teamfight tactics', 'diablo', 'path of exile', 'lost ark', 'world of warcraft',
  'guild wars', 'final fantasy xiv', 'lineage', 'black desert', 'heartstone',
  'call of duty', 'battlefield', 'apex', 'pubg', 'deadlock', 'brawl stars', 'clash'
]

const translations: Record<string, any> = {
  ukrainian: {
    title: "Якість ігрового часу",
    description: "Метрика цифрового детоксу: показує баланс між емоційним відпочинком та рутинною ігровою «роботою». Сюжетні ігри дарують емоції, сесійні — споживають час.",
    storyLabel: "Сюжетні / Емоційні",
    sessionLabel: "Сесійні / Рутинні",
    recentPlaytime: "Награно за 2 тижні:",
    qualityMetric: "Показник балансу",
    customizeHeader: "Налаштування категорій ігор",
    customizeDesc: "Тут ви можете вручну змінити категорію ігор, зіграних за останні 2 тижні. Ми автоматично класифікували відомі ігри.",
    statusLabel: "Статус",
    storyBtn: "Сюжетна",
    sessionBtn: "Сесійна",
    hoursSuffix: "год",
    tipsTitle: "Рекомендація",
    states: {
      inactive: {
        title: "Чудовий баланс з реалом",
        desc: "Мало ігрового часу за останні 2 тижні. Ви успішно фокусуєтеся на реальному житті!"
      },
      critical: {
        title: "Друга зміна на роботі",
        desc: "Чувак, ти не відпочиваєш, ти працюєш на другу зміну! Сходи пограй у щось лінійне й атмосферне або вимкни комп'ютер і прогуляйся."
      },
      poor: {
        title: "Дефіцит емоцій",
        desc: "У твоєму раціоні занадто багато сесійок. Вони виснажують, а не дають нові емоції. Спробуй розбавити їх хорошою сюжетною грою."
      },
      balanced: {
        title: "Хороший баланс",
        desc: "Хороший баланс! Ти успішно поєднуєш сесійні катки з атмосферними історіями. Продовжуй у тому ж дусі."
      },
      excellent: {
        title: "Чисте задоволення",
        desc: "Чудова якість ігрового часу! Ти граєш заради емоцій та сюжетів. Справжній відпочинок для душі."
      }
    },
    // Roulette UA
    rouletteBtn: "Витягни мене з цього болота!",
    rouletteTitle: "Рятувальний круг",
    rouletteSpinning: "Обираємо гру...",
    rouletteLanding: "Забий на сесійки сьогодні! Повернись у цю гру, там на тебе чекають справжні емоції:",
    roulettePlaytime: "У тебе там {hours} год. Грай атмосферно!",
    rouletteAgain: "Крутити ще раз",
    rouletteLaunch: "Запустити гру",
    rouletteAchievements: "Досягнення"
  },
  english: {
    title: "Gaming Time Quality",
    description: "Digital detox metric: shows the balance between emotional rest and routine gaming 'work'. Story games yield emotions, session games drain time.",
    storyLabel: "Story / Emotional",
    sessionLabel: "Session / Routine",
    recentPlaytime: "Played in 2 weeks:",
    qualityMetric: "Balance Score",
    customizeHeader: "Configure Game Categories",
    customizeDesc: "Here you can manually toggle the category of games played in the last 2 weeks. We auto-classified popular titles.",
    statusLabel: "Status",
    storyBtn: "Story-driven",
    sessionBtn: "Session-based",
    hoursSuffix: "hrs",
    tipsTitle: "Hygiene Tip",
    states: {
      inactive: {
        title: "Great real-life balance",
        desc: "Very little playtime in the past 2 weeks. A great balance with real life!"
      },
      critical: {
        title: "Second shift worker",
        desc: "Dude, you're not resting, you're working a second shift! Go play something linear and atmospheric, or just turn off the computer and go outside."
      },
      poor: {
        title: "Emotional deficit",
        desc: "Too many session games in your diet. They drain you rather than give new emotions. Try diluting them with a good story game."
      },
      balanced: {
        title: "Good balance",
        desc: "Good balance! You successfully combine session matches with atmospheric stories. Keep it up."
      },
      excellent: {
        title: "Pure enjoyment",
        desc: "Excellent gaming quality! You play for emotions and stories. A true rest for your mind."
      }
    },
    // Roulette EN
    rouletteBtn: "Get Me Out of This Swamp!",
    rouletteTitle: "Life Saver Roulette",
    rouletteSpinning: "Choosing a game...",
    rouletteLanding: "Forget about competitive matches today! Return to this game for some real emotions:",
    roulettePlaytime: "You have {hours} hrs there. Play atmospheric!",
    rouletteAgain: "Spin Again",
    rouletteLaunch: "Launch Game",
    rouletteAchievements: "Achievements"
  },
  russian: {
    title: "Качество игрового времени",
    description: "Метрика цифрового детокса: показывает баланс между эмоциональным отдыхом и рутинной игровой «работой». Сюжетные игры дарят эмоции, сессионные — сжигают время.",
    storyLabel: "Сюжетные / Эмоциональные",
    sessionLabel: "Сессионные / Рутинные",
    recentPlaytime: "Наиграно за 2 недели:",
    qualityMetric: "Показатель баланса",
    customizeHeader: "Настройка категорий игр",
    customizeDesc: "Здесь вы можете вручную изменить категорию игр, запущенных за последние 2 недели. Известные игры классифицированы автоматически.",
    statusLabel: "Статус",
    storyBtn: "Сюжетная",
    sessionBtn: "Сессионная",
    hoursSuffix: "ч",
    tipsTitle: "Рекомендация",
    states: {
      inactive: {
        title: "Отличный баланс с реалом",
        desc: "Мало игрового времени за последние 2 недели. Вы отлично справляетесь в реальном мире!"
      },
      critical: {
        title: "Вторая смена на работе",
        desc: "Чувак, ты не отдыхаешь, ты работаешь во вторую смену! Сходи поиграй во что-то линейное и атмосферное или вообще выключи компьютер и прогуляйся."
      },
      poor: {
        title: "Дефицит эмоций",
        desc: "В твоем рационе слишком много сессионок. Они истощают, а не дают новые эмоции. Попробуй разбавить их хорошей сюжетной игрой."
      },
      balanced: {
        title: "Хороший баланс",
        desc: "Хороший баланс! Ты успешно совмещаешь сессионные катки с атмосферными историями. Продолжай в том же духе."
      },
      excellent: {
        title: "Чистое удовольствие",
        desc: "Отличное качество игрового времени! Ты играешь ради эмоций и сюжетов. Настоящий отдых для души."
      }
    },
    // Roulette RU
    rouletteBtn: "Вытащи меня из этого болота!",
    rouletteTitle: "Спасательный круг",
    rouletteSpinning: "Выбираем игру...",
    rouletteLanding: "Забей на сессионки сегодня! Вернись в эту игру, там тебя ждут настоящие эмоции:",
    roulettePlaytime: "У тебя там {hours} ч. Играй атмосферно!",
    rouletteAgain: "Крутить еще раз",
    rouletteLaunch: "Запустить игру",
    rouletteAchievements: "Достижения"
  }
}

const t = computed(() => translations[selectedLang.value] || translations.english)

function isDefaultSessionGame(name: string): boolean {
  const lowercaseName = name.toLowerCase()
  return SESSION_GAME_KEYWORDS.some(keyword => lowercaseName.includes(keyword))
}

function getGameCategory(game: SteamGame): 'story' | 'session' {
  if (manualCategories.value[game.appid]) {
    return manualCategories.value[game.appid]
  }
  return isDefaultSessionGame(game.name) ? 'session' : 'story'
}

function toggleGameCategory(appid: number) {
  const current = manualCategories.value[appid] || (isDefaultSessionGame(games.value.find(g => g.appid === appid)?.name || '') ? 'session' : 'story')
  const next = current === 'story' ? 'session' : 'story'
  manualCategories.value[appid] = next
  if (import.meta.client) {
    localStorage.setItem('steam_game_categories', JSON.stringify(manualCategories.value))
  }
}

// Computeds for Gaming Time Quality metrics
const recentlyPlayedGames = computed(() => {
  return games.value.filter(g => g.playtime_2weeks && g.playtime_2weeks > 0)
})

const recentStoryMinutes = computed(() => {
  return recentlyPlayedGames.value.reduce((sum, g) => getGameCategory(g) === 'story' ? sum + (g.playtime_2weeks || 0) : sum, 0)
})

const recentSessionMinutes = computed(() => {
  return recentlyPlayedGames.value.reduce((sum, g) => getGameCategory(g) === 'session' ? sum + (g.playtime_2weeks || 0) : sum, 0)
})

const recentTotalMinutes = computed(() => {
  return recentStoryMinutes.value + recentSessionMinutes.value
})

const recentStoryHours = computed(() => Math.round((recentStoryMinutes.value / 60) * 10) / 10)
const recentSessionHours = computed(() => Math.round((recentSessionMinutes.value / 60) * 10) / 10)
const recentTotalHours = computed(() => Math.round((recentTotalMinutes.value / 60) * 10) / 10)

const storyPercentage = computed(() => {
  if (recentTotalMinutes.value === 0) return 0
  return Math.round((recentStoryMinutes.value / recentTotalMinutes.value) * 100)
})

const hygieneStatus = computed(() => {
  if (recentTotalHours.value < 0.5) return 'inactive'
  
  // Weekly threshold is 15h of session games (which is 30h in 2 weeks as user mentioned "якщо за тиждень награв 30 годин" or "за 2 тижні")
  // Let's check if session games hours in 2 weeks >= 25 OR if story percentage is extremely low under high session hours
  if (storyPercentage.value < 20 && recentSessionHours.value >= 20) {
    return 'critical'
  }
  if (storyPercentage.value < 35) {
    return 'poor'
  }
  if (storyPercentage.value >= 35 && storyPercentage.value < 70) {
    return 'balanced'
  }
  return 'excellent'
})

const hygieneBadgeClass = computed(() => {
  switch (hygieneStatus.value) {
    case 'excellent': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
    case 'balanced': return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20'
    case 'poor': return 'bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20'
    case 'critical': return 'bg-rose-500/10 text-rose-600 dark:text-rose-500 border-rose-500/20 shadow-xs'
    default: return 'bg-muted text-muted-foreground border-border'
  }
})

const adviceBoxClass = computed(() => {
  switch (hygieneStatus.value) {
    case 'excellent': return 'bg-emerald-500/5 border-emerald-500/10 text-emerald-800 dark:text-emerald-300'
    case 'balanced': return 'bg-cyan-500/5 border-cyan-500/10 text-cyan-800 dark:text-cyan-300'
    case 'poor': return 'bg-amber-500/5 border-amber-500/10 text-amber-800 dark:text-amber-300'
    case 'critical': return 'bg-rose-500/5 border-rose-500/10 text-rose-800 dark:text-rose-400 shadow-xs'
    default: return 'bg-muted/10 border-border text-muted-foreground'
  }
})

const detoxCardClass = computed(() => {
  switch (hygieneStatus.value) {
    case 'excellent': return 'detox-card-excellent border-emerald-500/20'
    case 'balanced': return 'detox-card-balanced border-cyan-500/20'
    case 'poor': return 'detox-card-poor border-amber-500/20'
    case 'critical': return 'detox-card-critical border-rose-500/30'
    default: return 'border-border/80 shadow-md'
  }
})

// Theme variables
const isDark = ref(true)

// Roulette state variables
const showRouletteModal = ref(false)
const isSpinning = ref(false)
const candidateGames = ref<SteamGame[]>([])
const reelGames = ref<SteamGame[]>([])
const reelTranslateY = ref(0)
const transitionEnabled = ref(false)
const finalSelectedGame = ref<SteamGame | null>(null)

const reelStyle = computed(() => {
  return {
    transform: `translateY(${reelTranslateY.value}px)`,
    transition: transitionEnabled.value ? 'transform 3.0s cubic-bezier(0.1, 0.85, 0.25, 1)' : 'none'
  }
})

function selectRouletteCandidates() {
  // Filter story games that have playtime between 1h (60m) and 100h (6000m)
  let candidates = games.value.filter(g => {
    const category = getGameCategory(g)
    return category === 'story' && g.playtime_forever >= 60 && g.playtime_forever <= 6000
  })

  // Fallback 1: Allow any story game with playtime >= 5 mins (started but not finished)
  if (candidates.length < 3) {
    candidates = games.value.filter(g => {
      const category = getGameCategory(g)
      return category === 'story' && g.playtime_forever >= 5
    })
  }

  // Fallback 2: Allow any story game in the library
  if (candidates.length < 3) {
    candidates = games.value.filter(g => getGameCategory(g) === 'story')
  }

  // Fallback 3: Allow any game at all
  if (candidates.length < 3) {
    candidates = [...games.value]
  }

  // Shuffle and grab up to 12 candidates
  const shuffled = [...candidates].sort(() => 0.5 - Math.random())
  candidateGames.value = shuffled.slice(0, Math.min(shuffled.length, 12))
}

function startRoulette() {
  if (isSpinning.value) return
  
  selectRouletteCandidates()
  if (candidateGames.value.length === 0) return

  // Build the reel tape
  const pool = candidateGames.value
  const repeats = 6
  const list: SteamGame[] = []
  for (let i = 0; i < repeats; i++) {
    list.push(...pool)
  }
  reelGames.value = list

  // Reset offset and transition
  transitionEnabled.value = false
  reelTranslateY.value = 0
  finalSelectedGame.value = null
  isSpinning.value = true
  showRouletteModal.value = true

  // Let browser layout adjust and run the transition scroll
  setTimeout(() => {
    transitionEnabled.value = true
    const randomIndex = Math.floor(Math.random() * pool.length)
    // Land on the second-to-last repeat block
    const targetIndex = (repeats - 2) * pool.length + randomIndex
    
    // Height of each reel item is 128px (h-32 = 8rem = 128px)
    reelTranslateY.value = - (targetIndex * 128)

    setTimeout(() => {
      isSpinning.value = false
      finalSelectedGame.value = pool[randomIndex]
    }, 3100)
  }, 50)
}
let toggleTheme = () => {}

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

  // Load manual categories from local storage
  if (import.meta.client) {
    const savedCats = localStorage.getItem('steam_game_categories')
    if (savedCats) {
      try {
        manualCategories.value = JSON.parse(savedCats)
      } catch (e) {
        console.error('Error loading manual categories:', e)
      }
    }
  }
  
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

/* Custom Progress Bar Indicator colors targeting scoped slots */
.progress-excellent :deep([data-slot="progress-indicator"]) {
  background-color: var(--emerald-500, #10b981) !important;
}
.progress-balanced :deep([data-slot="progress-indicator"]) {
  background-color: var(--cyan-400, #22d3ee) !important;
}
.progress-poor :deep([data-slot="progress-indicator"]) {
  background-color: var(--amber-500, #f59e0b) !important;
}
.progress-critical :deep([data-slot="progress-indicator"]) {
  background-color: var(--rose-500, #f43f5e) !important;
}
.progress-inactive :deep([data-slot="progress-indicator"]) {
  background-color: var(--muted-foreground, #737373) !important;
}

/* Slide-fade transition for categorizer */
.slide-fade-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-12px);
  opacity: 0;
}

/* Detox Card Pulsing Glow Keyframes & Classes */
.detox-card-excellent {
  box-shadow: 0 0 15px 1px rgba(16, 185, 129, 0.08);
  animation: pulse-excellent 4s infinite ease-in-out;
}
.detox-card-balanced {
  box-shadow: 0 0 15px 1px rgba(6, 182, 212, 0.08);
  animation: pulse-balanced 4s infinite ease-in-out;
}
.detox-card-poor {
  box-shadow: 0 0 15px 1px rgba(245, 158, 11, 0.1);
  animation: pulse-poor 4s infinite ease-in-out;
}
.detox-card-critical {
  box-shadow: 0 0 18px 2px rgba(244, 63, 94, 0.15);
  animation: pulse-critical 3s infinite ease-in-out;
}

@keyframes pulse-excellent {
  0%, 100% {
    box-shadow: 0 0 15px 1px rgba(16, 185, 129, 0.08);
    border-color: rgba(16, 185, 129, 0.2);
  }
  50% {
    box-shadow: 0 0 25px 3px rgba(16, 185, 129, 0.15);
    border-color: rgba(16, 185, 129, 0.45);
  }
}
@keyframes pulse-balanced {
  0%, 100% {
    box-shadow: 0 0 15px 1px rgba(6, 182, 212, 0.08);
    border-color: rgba(6, 182, 212, 0.2);
  }
  50% {
    box-shadow: 0 0 25px 3px rgba(6, 182, 212, 0.15);
    border-color: rgba(6, 182, 212, 0.45);
  }
}
@keyframes pulse-poor {
  0%, 100% {
    box-shadow: 0 0 15px 1px rgba(245, 158, 11, 0.1);
    border-color: rgba(245, 158, 11, 0.2);
  }
  50% {
    box-shadow: 0 0 25px 4px rgba(245, 158, 11, 0.18);
    border-color: rgba(245, 158, 11, 0.45);
  }
}
@keyframes pulse-critical {
  0%, 100% {
    box-shadow: 0 0 18px 2px rgba(244, 63, 94, 0.12);
    border-color: rgba(244, 63, 94, 0.25);
  }
  50% {
    box-shadow: 0 0 28px 5px rgba(244, 63, 94, 0.24);
    border-color: rgba(244, 63, 94, 0.6);
  }
}
</style>
