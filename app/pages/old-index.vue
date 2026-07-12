<template>
  <NuxtLayout>
    <!-- Left slot of layout header -->
    <template #header-left>
      <div class="p-2.5 rounded-xl bg-card border border-border shadow-xs">
        <!-- Gamepad Icon -->
        <Gamepad2Icon class="w-8 h-8 text-cyan-400" />
      </div>
      <div>
        <h1
          class="text-2xl sm:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r dark:from-neutral-50 dark:via-neutral-100 dark:to-neutral-400 from-neutral-900 via-neutral-800 to-neutral-600"
        >
          {{ $t("index.title") }}
        </h1>
        <p class="text-xs sm:text-sm text-muted-foreground font-medium">
          {{ $t("index.subtitle") }}
        </p>
      </div>
    </template>

    <!-- Right slot of layout header (action buttons) -->
    <template #header-actions>
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
        <RotateCwIcon
          class="w-5 h-5 transition-transform duration-75 group-hover:rotate-180"
          :class="{ 'animate-spin': isLoading }"
        />
      </UiButton>

      <!-- Analytics Button -->
      <UiButton v-if="games.length > 0" variant="outline" as-child>
        <NuxtLinkLocale to="/analytics" class="flex items-center gap-2">
          <BarChart2Icon class="w-4 h-4 text-violet-400" />
          <span>{{ $t("index.analyticsBtn") }}</span>
        </NuxtLinkLocale>
      </UiButton>

      <!-- Copy Report Button -->
      <UiButton
        v-if="games.length > 0"
        variant="outline"
        @click="openCopyModal"
        class="flex items-center gap-2"
      >
        <CopyIcon class="w-4 h-4 text-cyan-400" />
        <span>{{ $t("exportReport.btn") }}</span>
      </UiButton>

      <!-- Settings Config Button -->
      <UiButton variant="outline" @click="showSettings = true">
        <SettingsIcon class="w-4 h-4 mr-2" />
        <span>{{ $t("index.configBtn") }}</span>
      </UiButton>
    </template>

    <!-- Global Stats Summary (Show only when games loaded) -->
    <section
      v-if="games.length > 0"
      class="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8 animate-fade-in"
    >
      <!-- Stat Card 1: Total Games -->
      <UiCard class="relative overflow-hidden">
        <UiCardContent>
          <div class="absolute -right-4 -bottom-4 opacity-10 text-cyan-400">
            <Gamepad2Icon class="w-24 h-24" />
          </div>
          <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {{ $t("index.stats.totalGames") }}
          </p>
          <p class="text-3xl font-extrabold mt-2 tracking-tight">{{ totalCount }}</p>
          <p class="text-xs text-muted-foreground/85 mt-1">
            {{ $t("index.stats.totalGamesDesc") }}
          </p>
        </UiCardContent>
      </UiCard>

      <!-- Stat Card 2: Total Time -->
      <UiCard class="relative overflow-hidden">
        <UiCardContent>
          <div class="absolute -right-4 -bottom-4 opacity-10 text-violet-400">
            <ClockIcon class="w-24 h-24" />
          </div>
          <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {{ $t("index.stats.totalPlaytime") }}
          </p>
          <p class="text-3xl font-extrabold mt-2 tracking-tight">
            {{ formatHours(totalHours) }}
            <span class="text-sm font-semibold text-muted-foreground">{{
              $t("common.hoursSuffix")
            }}</span>
          </p>
          <p class="text-xs text-muted-foreground/85 mt-1">
            {{ $t("index.stats.totalPlaytimeDesc") }}
          </p>
        </UiCardContent>
      </UiCard>

      <!-- Stat Card 3: Most Played -->
      <UiCard class="relative overflow-hidden">
        <UiCardContent>
          <div class="absolute -right-4 -bottom-4 opacity-10 text-indigo-400">
            <StarIcon class="w-24 h-24" />
          </div>
          <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {{ $t("index.stats.mostPlayed") }}
          </p>
          <p class="text-xl font-extrabold mt-2 truncate pr-16 tracking-tight">
            {{ mostPlayedGame?.name || $t("index.stats.none") }}
          </p>
          <p class="text-xs mt-1 font-semibold text-indigo-400">
            {{
              mostPlayedGame
                ? formatHours(mostPlayedGame.playtime_hours) + " " + $t("common.hoursSuffix")
                : "0 " + $t("common.hoursSuffix")
            }}
          </p>
        </UiCardContent>
      </UiCard>
    </section>

    <!-- Gaming Time Quality Card -->
    <section v-if="games.length > 0" class="mb-8 animate-fade-in">
      <UiCard
        :class="detoxCardClass"
        class="overflow-hidden bg-gradient-to-br from-card to-card/50 transition-all duration-500"
      >
        <UiCardContent class="p-6">
          <!-- Header Row -->
          <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/60"
          >
            <div class="flex items-center gap-3">
              <div
                class="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0"
              >
                <ShieldIcon class="w-6 h-6" />
              </div>
              <div>
                <h2 class="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  {{ $t("detox.title") }}
                </h2>
                <p class="text-xs text-muted-foreground font-medium mt-0.5">
                  {{ $t("detox.description") }}
                </p>
              </div>
            </div>

            <!-- Status Badge -->
            <div class="self-start sm:self-auto flex items-center gap-2">
              <span class="text-xs text-muted-foreground font-semibold uppercase tracking-wider"
                >{{ $t("detox.statusLabel") }}:</span
              >
              <UiBadge
                :class="hygieneBadgeClass"
                class="text-xs py-1 px-3 font-bold border rounded-lg transition-all duration-300"
              >
                {{ $t("detox.states." + hygieneStatus + ".title") }}
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
                  <h4
                    class="font-extrabold text-sm tracking-tight mb-1 uppercase tracking-wide opacity-90"
                  >
                    {{ $t("detox.tipsTitle") }}
                  </h4>
                  <p class="text-sm leading-relaxed font-semibold opacity-95">
                    {{ $t("detox.states." + hygieneStatus + ".desc") }}
                  </p>

                  <!-- Roulette Trigger Button -->
                  <div
                    v-if="hygieneStatus === 'critical' || hygieneStatus === 'poor'"
                    class="mt-3.5 animate-bounce"
                  >
                    <UiButton
                      size="sm"
                      class="bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-900/10 transition-all duration-300 active:scale-95 border-0 flex items-center gap-1.5"
                      @click="startRoulette"
                    >
                      <span>🔮</span>
                      <span>{{ $t("roulette.btn") }}</span>
                    </UiButton>
                  </div>
                </div>
              </div>

              <!-- Progress Bar / Scale -->
              <div class="space-y-3.5">
                <div
                  class="flex items-center justify-between text-xs font-semibold text-muted-foreground"
                >
                  <span class="flex items-center gap-1.5"
                    ><span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span> 🎮
                    {{ $t("detox.sessionLabel") }}</span
                  >
                  <span class="text-foreground text-sm font-black"
                    >{{ storyPercentage }}% {{ $t("detox.storyLabel") }}</span
                  >
                  <span class="flex items-center gap-1.5"
                    ><span class="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> 🎭
                    {{ $t("detox.storyLabel") }}</span
                  >
                </div>

                <UiProgress
                  :model-value="storyPercentage"
                  class="h-3.5 bg-neutral-200 dark:bg-neutral-800/80 rounded-full overflow-hidden"
                  :class="'progress-' + hygieneStatus"
                />

                <div
                  class="flex items-center justify-between text-[10px] text-muted-foreground/80 font-bold uppercase tracking-wider"
                >
                  <span>100% {{ $t("detox.sessionLabel") }}</span>
                  <span>50/50 Balance</span>
                  <span>100% {{ $t("detox.storyLabel") }}</span>
                </div>
              </div>
            </div>

            <!-- Right Column: Recent Playtime Summary & Toggle -->
            <div
              class="p-5 rounded-2xl bg-card/30 border border-border/80 flex flex-col justify-between gap-6"
            >
              <div class="space-y-4">
                <h3 class="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  {{ $t("detox.recentPlaytime") }}
                </h3>

                <div class="space-y-3">
                  <!-- Total Recent Time -->
                  <div class="flex justify-between items-baseline pb-2.5 border-b border-border/60">
                    <span class="text-sm text-muted-foreground font-semibold">Total</span>
                    <span class="text-2xl font-black text-foreground"
                      >{{ formatHours(recentTotalHours) }}
                      <span class="text-xs font-semibold text-muted-foreground">{{
                        $t("common.hoursSuffix")
                      }}</span></span
                    >
                  </div>

                  <!-- Story Hours -->
                  <div class="flex justify-between items-center">
                    <span class="text-xs font-semibold text-muted-foreground">{{
                      $t("detox.storyLabel")
                    }}</span>
                    <span class="text-sm font-bold text-cyan-400"
                      >{{ formatHours(recentStoryHours) }} {{ $t("common.hoursSuffix") }}</span
                    >
                  </div>

                  <!-- Session Hours -->
                  <div class="flex justify-between items-center">
                    <span class="text-xs font-semibold text-muted-foreground">{{
                      $t("detox.sessionLabel")
                    }}</span>
                    <span class="text-sm font-bold text-rose-500"
                      >{{ formatHours(recentSessionHours) }} {{ $t("common.hoursSuffix") }}</span
                    >
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
                <SettingsIcon class="w-4 h-4 mr-2" />
                <span>{{
                  showCategorizer ? $t("detox.hideCategorizer") : $t("detox.showCategorizer")
                }}</span>
              </UiButton>
            </div>
          </div>

          <!-- Game Categorizer (Collapsible Panel) -->
          <transition name="slide-fade">
            <div
              v-if="showCategorizer && recentlyPlayedGames.length > 0"
              class="mt-6 pt-6 border-t border-border/60"
            >
              <div class="mb-4">
                <h3 class="text-sm font-bold text-foreground">{{ $t("detox.customizeHeader") }}</h3>
                <p class="text-xs text-muted-foreground font-medium mt-0.5">
                  {{ $t("detox.customizeDesc") }}
                </p>
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
                      <p
                        v-if="game.playtime_2weeks"
                        class="text-[10px] text-muted-foreground/90 font-semibold mt-0.5"
                      >
                        {{ Math.round((game.playtime_2weeks / 60) * 10) / 10 }}
                        {{ $t("common.hoursSuffix") }}
                      </p>
                    </div>
                  </div>

                  <!-- Category toggle switch/button -->
                  <UiButton
                    variant="outline"
                    size="icon"
                    class="h-8 w-8 rounded-xl shrink-0 transition-transform active:scale-95"
                    :class="
                      getGameCategory(game) === 'story'
                        ? 'text-cyan-400 bg-cyan-500/5 border-cyan-500/20 hover:text-cyan-300'
                        : 'text-rose-500 bg-rose-500/5 border-rose-500/20 hover:text-rose-400'
                    "
                    :title="
                      getGameCategory(game) === 'story'
                        ? $t('detox.storyBtn')
                        : $t('detox.sessionBtn')
                    "
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
    <CommonSettingsDialog
      v-model:open="showSettings"
      v-model:apiKey="apiKey"
      v-model:steamId="steamId"
      :is-loading="isLoading"
      :loaded-from-env="loadedFromEnv"
      :has-saved-credentials="hasSavedCredentials"
      @save="saveSettings"
      @clear="clearSettings"
      @import="handleImport"
    />

    <!-- Main Controls and Grid -->
    <section v-if="games.length > 0" class="space-y-6 animate-fade-in">
      <!-- Controls: Search & Sort Tabs -->
      <div
        class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border"
      >
        <!-- Search Bar -->
        <div class="relative flex-1 max-w-md">
          <span
            class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground z-10"
          >
            <SearchIcon class="w-4.5 h-4.5" />
          </span>
          <UiInput
            type="text"
            v-model="searchQuery"
            :placeholder="$t('index.searchPlaceholder')"
            class="w-full pl-9 pr-8"
          />
          <UiButton
            v-if="searchQuery"
            variant="ghost"
            size="icon"
            @click="searchQuery = ''"
            class="absolute right-0 top-0 bottom-0"
          >
            <XIcon class="w-4 h-4" />
          </UiButton>
        </div>

        <!-- Sorting Tabs Selector (shadcn tabs) -->
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <span
            class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-2 shrink-0"
            >{{ $t("index.sortBy") }}</span
          >
          <UiTabs v-model="sortBy" class="w-auto">
            <UiTabsList>
              <UiTabsTrigger value="lastPlayed">{{
                $t("index.sortOptions.lastPlayed")
              }}</UiTabsTrigger>
              <UiTabsTrigger value="playtimeDesc">{{
                $t("index.sortOptions.playtimeDesc")
              }}</UiTabsTrigger>
              <UiTabsTrigger value="playtimeAsc">{{
                $t("index.sortOptions.playtimeAsc")
              }}</UiTabsTrigger>
              <UiTabsTrigger value="name">{{ $t("index.sortOptions.name") }}</UiTabsTrigger>
            </UiTabsList>
          </UiTabs>
        </div>
      </div>

      <!-- Error Alert -->
      <div
        v-if="error"
        class="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive-foreground text-sm flex items-start gap-3"
      >
        <AlertCircleIcon class="w-5 h-5 text-destructive shrink-0 mt-0.5" />
        <div class="flex-1">
          <span class="font-bold">{{ $t("index.errorLoading") }}</span> {{ error }}
          <UiButton
            variant="link"
            @click="showSettings = true"
            class="p-0 h-auto text-xs font-bold block mt-2 text-cyan-400 hover:text-cyan-300"
          >
            {{ $t("index.configureSettings") }} &rarr;
          </UiButton>
        </div>
      </div>

      <!-- Loading Skeleton Grid -->
      <div
        v-if="isLoading"
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
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
      <div
        v-else-if="filteredAndSortedGames.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
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
            <div
              class="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent opacity-60"
            ></div>

            <!-- App ID Badge (shadcn Badge) -->
            <UiBadge variant="secondary" class="absolute top-2.5 right-2.5">
              ID: {{ game.appid }}
            </UiBadge>

            <!-- Hover Actions overlay -->
            <div
              class="absolute inset-0 bg-neutral-950/85 opacity-0 group-hover:opacity-100 transition-opacity duration-100 flex flex-col items-center justify-center gap-3"
            >
              <UiButton as-child class="w-[80%]">
                <a :href="'steam://run/' + game.appid">
                  <PlayIcon class="w-4 h-4 fill-current mr-2" />
                  <span>{{ $t("index.playGame") }}</span>
                </a>
              </UiButton>

              <UiButton as-child variant="outline" class="w-[80%]">
                <NuxtLinkLocale :to="`/game/${game.appid}`">
                  <StarIcon class="w-4 h-4 mr-2" />
                  <span>{{ $t("index.achievements") }}</span>
                </NuxtLinkLocale>
              </UiButton>
            </div>
          </div>

          <!-- Game Details -->
          <UiCardContent class="flex flex-col flex-1 justify-between gap-4">
            <div>
              <h3
                class="font-bold text-sm sm:text-base text-foreground group-hover:text-cyan-500 dark:group-hover:text-cyan-300 line-clamp-1 transition-colors tracking-tight"
              >
                {{ game.name }}
              </h3>

              <div
                class="flex items-center gap-1.5 mt-2.5 text-xs text-muted-foreground font-medium"
              >
                <ClockIcon class="w-3.5 h-3.5 text-muted-foreground" />
                <span>{{ $t("index.lastLaunched", { time: game.last_played_relative }) }}</span>
              </div>
            </div>

            <!-- Playtime Stats -->
            <div class="flex items-center justify-between pt-3 border-t border-border">
              <div class="flex flex-col">
                <span
                  class="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold"
                  >{{ $t("index.totalPlaytimeCard") }}</span
                >
                <span class="text-xs font-extrabold text-foreground mt-0.5">
                  {{ formatHours(game.playtime_hours) }}
                  <span class="text-[10px] font-medium text-muted-foreground">{{
                    $t("common.hoursSuffix")
                  }}</span>
                </span>
              </div>

              <!-- If played recently -->
              <div
                v-if="game.playtime_2weeks && game.playtime_2weeks > 0"
                class="flex flex-col items-end"
              >
                <span class="text-[10px] text-cyan-500 uppercase tracking-wider font-semibold">{{
                  $t("index.recent")
                }}</span>
                <span class="text-xs font-bold text-cyan-400 mt-0.5">
                  +{{ Math.round((game.playtime_2weeks / 60) * 10) / 10 }}
                  {{ $t("common.hoursSuffix") }}
                </span>
              </div>
            </div>
          </UiCardContent>
        </UiCard>
      </div>

      <!-- Empty Results Page -->
      <UiCard v-else class="max-w-md mx-auto text-center">
        <UiCardContent>
          <div
            class="w-16 h-16 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-500 mb-4"
          >
            <SearchIcon class="w-8 h-8" />
          </div>
          <h3 class="font-bold text-base">{{ $t("index.noGames") }}</h3>
          <p class="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
            {{ $t("index.noGamesDesc") }}
          </p>
          <UiButton variant="outline" @click="searchQuery = ''" class="mt-5">
            {{ $t("index.clearSearch") }}
          </UiButton>
        </UiCardContent>
      </UiCard>
    </section>

    <!-- Roulette Modal -->
    <div
      v-if="showRouletteModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all duration-300 animate-fade-in"
    >
      <div
        class="relative w-full max-w-md bg-card border border-border/80 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center overflow-hidden"
      >
        <!-- Decorative background glow -->
        <div
          class="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"
        ></div>
        <div
          class="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-violet-500/10 blur-3xl pointer-events-none"
        ></div>

        <!-- Close button -->
        <button
          @click="showRouletteModal = false"
          class="absolute top-4 right-4 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-neutral-800 transition-colors cursor-pointer"
          title="Close"
        >
          <XIcon class="w-5 h-5" />
        </button>

        <!-- Modal Title -->
        <h3
          class="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400 mb-6 flex items-center gap-2"
        >
          <span>🎡</span> {{ $t("roulette.title") }}
        </h3>

        <!-- The Roulette Reel -->
        <div
          class="relative h-32 w-full overflow-hidden border border-cyan-500/30 rounded-2xl bg-neutral-950/70 shadow-[inset_0_0_24px_rgba(6,182,212,0.15)] mb-6 flex items-center justify-center"
        >
          <div class="absolute left-0 right-0 top-0" :style="reelStyle">
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
              <span
                class="text-sm font-black text-foreground truncate max-w-[260px] mt-2 tracking-tight"
                >{{ game.name }}</span
              >
            </div>
          </div>

          <!-- Viewport Overlay line markers -->
          <div
            class="absolute inset-x-0 inset-y-10 border-y border-cyan-500/20 bg-cyan-500/5 pointer-events-none"
          ></div>

          <!-- Side shadow overlays to make it look 3D cylindrical -->
          <div
            class="absolute inset-0 bg-gradient-to-b from-neutral-950/60 via-transparent to-neutral-950/60 pointer-events-none"
          ></div>
        </div>

        <!-- Spinner Status / Results -->
        <div class="w-full space-y-5">
          <div v-if="isSpinning" class="space-y-3">
            <p
              class="text-xs font-semibold text-muted-foreground uppercase tracking-widest animate-pulse"
            >
              {{ $t("roulette.spinning") }}
            </p>
            <div class="flex justify-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce"></span>
              <span
                class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]"
              ></span>
              <span
                class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]"
              ></span>
            </div>
          </div>

          <div v-else-if="finalSelectedGame" class="animate-fade-in space-y-5">
            <div class="p-4.5 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 text-sm">
              <span class="text-2xl mb-2 block select-none">✨</span>
              <p class="font-bold text-cyan-400 mb-2 leading-snug">{{ $t("roulette.landing") }}</p>
              <h4 class="text-lg font-black text-foreground tracking-tight">
                {{ finalSelectedGame.name }}
              </h4>
              <p class="text-xs text-muted-foreground font-semibold mt-1">
                {{
                  $t("roulette.playtime", { hours: formatHours(finalSelectedGame.playtime_hours) })
                }}
              </p>
            </div>

            <!-- Action buttons -->
            <div class="flex flex-col gap-2.5 w-full">
              <UiButton as-child class="w-full py-5 font-bold shadow-lg shadow-cyan-900/10">
                <a :href="'steam://run/' + finalSelectedGame.appid">
                  <PlayIcon class="w-4.5 h-4.5 fill-current mr-2" />
                  <span>{{ $t("roulette.launch") }}</span>
                </a>
              </UiButton>

              <div class="grid grid-cols-2 gap-2.5 w-full">
                <UiButton as-child variant="outline" size="sm" class="font-semibold">
                  <NuxtLink :to="'/game/' + finalSelectedGame.appid">
                    🏆 {{ $t("roulette.achievements") }}
                  </NuxtLink>
                </UiButton>

                <UiButton variant="outline" size="sm" class="font-semibold" @click="startRoulette">
                  🔄 {{ $t("roulette.again") }}
                </UiButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Export Achievements Report Modal -->
    <transition name="fade">
      <div
        v-if="showCopyModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md transition-opacity duration-300"
      >
        <div
          class="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-card border border-border/80 shadow-2xl overflow-hidden animate-fade-in"
        >
          <!-- Modal Header -->
          <div class="flex items-center justify-between p-5 border-b border-border/60">
            <div class="flex items-center gap-3">
              <FileTextIcon class="w-5.5 h-5.5 text-cyan-400" />
              <div>
                <h3 class="text-base font-bold text-foreground">
                  {{ $t("exportReport.title") }}
                </h3>
                <p class="text-xs text-muted-foreground mt-0.5 leading-normal">
                  {{ $t("exportReport.desc") }}
                </p>
              </div>
            </div>
            <UiButton
              variant="ghost"
              size="icon"
              @click="showCopyModal = false"
              class="rounded-full w-8 h-8 hover:bg-accent"
            >
              <XIcon class="w-4 h-4" />
            </UiButton>
          </div>

          <!-- Modal Body (Content) -->
          <div class="flex-1 overflow-y-auto p-5 space-y-5">
            <!-- Loading Progress Section -->
            <div
              v-if="isCopying"
              class="py-8 flex flex-col items-center justify-center text-center space-y-4"
            >
              <div class="relative flex items-center justify-center">
                <Loader2Icon class="w-10 h-10 text-cyan-400 animate-spin" />
              </div>
              <div class="space-y-1">
                <p class="font-bold text-sm text-foreground">
                  {{
                    $t("exportReport.fetchProgress", { current: copyProgress, total: copyTotal })
                  }}
                </p>
                <p class="text-xs text-muted-foreground italic max-w-md truncate">
                  {{ $t("exportReport.fetching", { game: copyCurrentGameName }) }}
                </p>
              </div>

              <!-- Progress Bar -->
              <div class="w-full max-w-md bg-muted rounded-full h-2.5 overflow-hidden">
                <div
                  class="bg-cyan-500 h-full transition-all duration-300 ease-out"
                  :style="{ width: `${(copyProgress / copyTotal) * 100}%` }"
                ></div>
              </div>

              <UiButton variant="outline" size="sm" @click="cancelExportReport">
                {{ $t("exportReport.cancel") }}
              </UiButton>
            </div>

            <!-- Report Options and Preview Section -->
            <div v-else class="space-y-5">
              <!-- Options Grid -->
              <div
                class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-muted/30 border border-border/40"
              >
                <div class="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="exportIncludeLocked"
                    v-model="exportIncludeLocked"
                    @change="regenerateReport"
                    class="rounded border-input text-cyan-500 focus:ring-cyan-500 w-4.5 h-4.5 bg-background cursor-pointer"
                  />
                  <label
                    for="exportIncludeLocked"
                    class="text-xs font-medium text-foreground cursor-pointer select-none"
                  >
                    {{ $t("exportReport.optIncludeLocked") }}
                  </label>
                </div>

                <div class="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="exportIncludeUnlocked"
                    v-model="exportIncludeUnlocked"
                    @change="regenerateReport"
                    class="rounded border-input text-cyan-500 focus:ring-cyan-500 w-4.5 h-4.5 bg-background cursor-pointer"
                  />
                  <label
                    for="exportIncludeUnlocked"
                    class="text-xs font-medium text-foreground cursor-pointer select-none"
                  >
                    {{ $t("exportReport.optIncludeUnlocked") }}
                  </label>
                </div>

                <div
                  v-if="exportIncludeLocked"
                  class="sm:col-span-2 pt-2 border-t border-border/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <label
                    for="exportLimitLocked"
                    class="text-xs font-medium text-muted-foreground select-none"
                  >
                    {{ $t("exportReport.optLimitLocked") }}
                  </label>
                  <div class="flex items-center gap-2">
                    <UiInput
                      type="number"
                      id="exportLimitLocked"
                      v-model.number="exportLimitLocked"
                      min="0"
                      max="100"
                      @input="regenerateReport"
                      class="w-20 text-center h-8 text-xs py-1"
                    />
                    <span class="text-[10px] text-neutral-500 leading-none">
                      {{ $t("exportReport.optLimitHelp") }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Empty state: Click to generate -->
              <div
                v-if="!copyReportText"
                class="py-12 flex flex-col items-center justify-center text-center space-y-4"
              >
                <div class="p-3 bg-cyan-500/10 text-cyan-400 rounded-full">
                  <FileTextIcon class="w-8 h-8" />
                </div>
                <UiButton @click="startExportReport">
                  {{ $t("exportReport.generateBtn") }}
                </UiButton>
              </div>

              <!-- Report Text Area -->
              <div v-else class="space-y-2">
                <textarea
                  readonly
                  class="w-full h-80 p-3.5 rounded-xl border border-border/80 bg-neutral-900 text-neutral-100 font-mono text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                  :value="copyReportText"
                  placeholder="Report will appear here..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="flex items-center justify-between p-4 border-t border-border/60 bg-muted/20">
            <span class="text-xs text-muted-foreground">
              {{ copyReportText ? $t("exportReport.totalGames", { count: totalCount }) : "" }}
            </span>
            <div class="flex items-center gap-3">
              <UiButton
                v-if="copyReportText && !isCopying"
                variant="outline"
                @click="startExportReport"
                size="sm"
                class="text-xs"
              >
                🔄 {{ $t("roulette.again") }}
              </UiButton>
              <UiButton
                v-if="copyReportText && !isCopying"
                @click="copyTextToClipboard(copyReportText)"
                size="sm"
                class="text-xs"
              >
                <CopyIcon class="w-4 h-4 mr-2" />
                {{ $t("exportReport.copyBtn") }}
              </UiButton>
              <UiButton
                variant="secondary"
                @click="showCopyModal = false"
                size="sm"
                class="text-xs"
              >
                {{ $t("common.close") }}
              </UiButton>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </NuxtLayout>
</template>

<script lang="ts" setup>
import {
  Gamepad2Icon,
  RotateCwIcon,
  BarChart2Icon,
  SettingsIcon,
  ClockIcon,
  StarIcon,
  ShieldIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  UploadIcon,
  DownloadIcon,
  SearchIcon,
  XIcon,
  PlayIcon,
  CopyIcon,
  Loader2Icon,
  FileTextIcon,
} from "@lucide/vue";
import { GameTypes } from "@/types";
import type { SteamGame } from "@/types";

const { locale, setLocale, t } = useI18n();
const {
  apiKey,
  steamId,
  games,
  totalHours,
  totalCount,
  isLoading,
  error,
  loadedFromEnv,
  loadCredentials,
  hasSavedCredentials,
  fetchGames,
  saveSettings,
} = useGameLibrary();

async function handleLangChange(value: any) {
  if (typeof value === "string") {
    localStorage.setItem("steam_language", value);
    await setLocale(value as any);
  }
}

// Page-specific state
const searchQuery = ref("");
const sortBy = ref<"lastPlayed" | "playtimeDesc" | "playtimeAsc" | "name">("lastPlayed");
const showSettings = ref(false);

// Export achievements report states
const showCopyModal = ref(false);
const isCopying = ref(false);
const copyProgress = ref(0);
const copyTotal = ref(0);
const copyCurrentGameName = ref("");
const copyReportText = ref("");

// Export options
const exportIncludeLocked = ref(true);
const exportIncludeUnlocked = ref(false);
const exportLimitLocked = ref(5);

// Cache for achievements to prevent redundant network requests
const achievementsCache = ref<Record<number, any>>({});

function openCopyModal() {
  showCopyModal.value = true;
  copyReportText.value = "";
}

function cancelExportReport() {
  isCopying.value = false;
}

async function startExportReport() {
  if (games.value.length === 0) {
    showFeedback(t("exportReport.noGames"), "error");
    return;
  }

  isCopying.value = true;
  copyProgress.value = 0;
  copyTotal.value = games.value.length;
  copyReportText.value = "";

  const apiKeyVal = apiKey.value || localStorage.getItem("steam_api_key") || "";
  const steamIdVal = steamId.value || localStorage.getItem("steam_id") || "";
  const langVal = locale.value;

  const results = [];
  const chunkSize = 5; // Fetch in chunks of 5 parallel requests to be friendly to Steam API

  for (let i = 0; i < games.value.length; i += chunkSize) {
    if (!isCopying.value) break;

    const chunk = games.value.slice(i, i + chunkSize);
    const promises = chunk.map(async (game) => {
      // Check memory cache first
      if (achievementsCache.value[game.appid]) {
        return { game, ...achievementsCache.value[game.appid] };
      }

      try {
        copyCurrentGameName.value = game.name;
        const params = new URLSearchParams();
        params.append("appid", String(game.appid));
        if (apiKeyVal.trim()) params.append("apiKey", apiKeyVal.trim());
        if (steamIdVal.trim()) params.append("steamId", steamIdVal.trim());
        params.append("lang", langVal);

        const response = await $fetch<any>(`/api/steam/achievements?${params.toString()}`);
        if (response.success) {
          const data = {
            hasAchievements: response.total_count !== undefined && response.total_count > 0,
            achievements: response.achievements || [],
            totalCount: response.total_count || 0,
            unlockedCount: response.unlocked_count || 0,
            unlockedPercent: response.unlocked_percent || 0,
          };
          achievementsCache.value[game.appid] = data;
          return { game, ...data };
        }
      } catch (err) {
        console.error(`Failed to fetch achievements for ${game.name}:`, err);
      }

      const defaultData = {
        hasAchievements: false,
        achievements: [],
        totalCount: 0,
        unlockedCount: 0,
        unlockedPercent: 0,
      };
      achievementsCache.value[game.appid] = defaultData;
      return { game, ...defaultData };
    });

    const chunkResults = await Promise.all(promises);
    results.push(...chunkResults);
    copyProgress.value = Math.min(i + chunkSize, games.value.length);
  }

  if (isCopying.value) {
    isCopying.value = false;
    regenerateReport();
  }
}

function regenerateReport() {
  const results = [];
  for (const game of games.value) {
    if (achievementsCache.value[game.appid]) {
      results.push({ game, ...achievementsCache.value[game.appid] });
    } else {
      results.push({
        game,
        hasAchievements: false,
        achievements: [],
        totalCount: 0,
        unlockedCount: 0,
        unlockedPercent: 0,
      });
    }
  }
  generateReport(results);
}

function generateReport(results: any[]) {
  let text = `🏆 Steam Library Report 🏆\n`;
  text += `Generated: ${new Date().toLocaleString()}\n`;
  text += `${t("exportReport.totalGames", { count: totalCount.value })}\n`;
  text += `Total Playtime: ${formatHours(totalHours.value)} ${t("common.hoursSuffix")}\n\n`;

  // Sort results by playtime descending
  const sortedResults = [...results].sort(
    (a, b) => b.game.playtime_forever - a.game.playtime_forever,
  );

  // Categorize games
  const completed = sortedResults.filter(
    (r) => r.hasAchievements && r.unlockedCount === r.totalCount,
  );
  const uncompleted = sortedResults.filter(
    (r) => r.hasAchievements && r.unlockedCount < r.totalCount,
  );
  const noAchievements = sortedResults.filter((r) => !r.hasAchievements);

  // 1. Completed Games Section
  text += `==========================================\n`;
  text += `${t("exportReport.completedSection")} [${completed.length}]\n`;
  text += `==========================================\n`;
  if (completed.length === 0) {
    text += `${t("exportReport.none")}\n`;
  } else {
    completed.forEach((r, idx) => {
      text += `${idx + 1}. ${r.game.name}\n`;
      text += `   - ${t("exportReport.playtime", { hours: formatHours(r.game.playtime_hours) })}\n`;
      text += `   - ${t("exportReport.achievementsProgress", { unlocked: r.unlockedCount, total: r.totalCount, percent: 100 })}\n`;
      if (exportIncludeUnlocked.value && r.achievements.length > 0) {
        text += `   - ${t("exportReport.unlockedAchievementsTitle")}\n`;
        r.achievements.forEach((ach: any) => {
          text += `     * [✓] ${ach.name} - ${ach.description || ""}\n`;
        });
      }
      text += `\n`;
    });
  }

  // 2. Uncompleted Games Section
  text += `==========================================\n`;
  text += `${t("exportReport.uncompletedSection")} [${uncompleted.length}]\n`;
  text += `==========================================\n`;
  if (uncompleted.length === 0) {
    text += `${t("exportReport.none")}\n`;
  } else {
    uncompleted.forEach((r, idx) => {
      text += `${idx + 1}. ${r.game.name}\n`;
      text += `   - ${t("exportReport.playtime", { hours: formatHours(r.game.playtime_hours) })}\n`;
      text += `   - ${t("exportReport.achievementsProgress", { unlocked: r.unlockedCount, total: r.totalCount, percent: r.unlockedPercent })}\n`;

      // Locked achievements list
      if (exportIncludeLocked.value) {
        const locked = r.achievements.filter((ach: any) => !ach.achieved);
        const limit = exportLimitLocked.value;
        const toShow = limit > 0 ? locked.slice(0, limit) : locked;
        if (toShow.length > 0) {
          text += `   - ${t("exportReport.lockedAchievementsTitle")} (${toShow.length} shown of ${locked.length}):\n`;
          toShow.forEach((ach: any) => {
            text += `     * [ ] ${ach.name} - ${ach.description || ""}\n`;
          });
        }
      }

      // Unlocked achievements list
      if (exportIncludeUnlocked.value) {
        const unlocked = r.achievements.filter((ach: any) => ach.achieved);
        if (unlocked.length > 0) {
          text += `   - ${t("exportReport.unlockedAchievementsTitle")}:\n`;
          unlocked.forEach((ach: any) => {
            text += `     * [✓] ${ach.name} - ${ach.description || ""}\n`;
          });
        }
      }
      text += `\n`;
    });
  }

  // 3. Games without achievements
  text += `==========================================\n`;
  text += `${t("exportReport.noAchievementsSection")} [${noAchievements.length}]\n`;
  text += `==========================================\n`;
  if (noAchievements.length === 0) {
    text += `${t("exportReport.none")}\n`;
  } else {
    noAchievements.forEach((r, idx) => {
      text += `${idx + 1}. ${r.game.name} (${formatHours(r.game.playtime_hours)} ${t("common.hoursSuffix")})\n`;
    });
  }

  copyReportText.value = text;

  // Auto copy to clipboard
  copyTextToClipboard(text);
}

function copyTextToClipboard(text: string) {
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showFeedback(t("exportReport.copied"), "success");
      })
      .catch((err) => {
        console.error("Failed to copy report to clipboard:", err);
      });
  }
}

const settingsFeedback = ref("");
const settingsFeedbackType = ref<"success" | "error">("success");
let feedbackTimer: ReturnType<typeof setTimeout> | null = null;

function showFeedback(message: string, type: "success" | "error" = "success") {
  if (feedbackTimer) {
    clearTimeout(feedbackTimer);
  }
  settingsFeedback.value = message;
  settingsFeedbackType.value = type;
  feedbackTimer = setTimeout(() => {
    settingsFeedback.value = "";
  }, 3500);
}

// State variables for Gaming Time Quality Feature
const manualCategories = ref<Record<number, GameTypes.Category>>({});
const showCategorizer = ref(false);

const SESSION_GAME_KEYWORDS = [
  "counter-strike",
  "cs:go",
  "cs2",
  "dota",
  "league of legends",
  "valorant",
  "apex legends",
  "pubg",
  "fortnite",
  "overwatch",
  "war thunder",
  "world of tanks",
  "world of warships",
  "team fortress",
  "rust",
  "dayz",
  "rainbow six",
  "destiny",
  "warframe",
  "helldivers",
  "gta online",
  "dead by daylight",
  "rocket league",
  "fifa",
  "madden",
  "nba 2k",
  "street fighter",
  "tekken",
  "mortal kombat",
  "brawlhalla",
  "among us",
  "phasmophobia",
  "lethal company",
  "roblox",
  "minecraft",
  "payday",
  "left 4 dead",
  "killing floor",
  "deep rock galactic",
  "hearthstone",
  "magic: the gathering",
  "yu-gi-oh",
  "tft",
  "teamfight tactics",
  "diablo",
  "path of exile",
  "lost ark",
  "world of warcraft",
  "guild wars",
  "final fantasy xiv",
  "lineage",
  "black desert",
  "heartstone",
  "call of duty",
  "battlefield",
  "apex",
  "pubg",
  "deadlock",
  "brawl stars",
  "clash",
];

function isDefaultSessionGame(name: string): boolean {
  const lowercaseName = name.toLowerCase();
  return SESSION_GAME_KEYWORDS.some((keyword) => lowercaseName.includes(keyword));
}

function getGameCategory(game: SteamGame): GameTypes.Category {
  const manual = manualCategories.value[game.appid];
  if (manual) {
    return manual;
  }
  return isDefaultSessionGame(game.name) ? GameTypes.Category.Session : GameTypes.Category.Story;
}

function toggleGameCategory(appid: number) {
  const current =
    manualCategories.value[appid] ||
    (isDefaultSessionGame(games.value.find((g) => g.appid === appid)?.name || "")
      ? GameTypes.Category.Session
      : GameTypes.Category.Story);
  const next =
    current === GameTypes.Category.Story ? GameTypes.Category.Session : GameTypes.Category.Story;
  manualCategories.value[appid] = next;
  if (import.meta.client) {
    localStorage.setItem("steam_game_categories", JSON.stringify(manualCategories.value));
  }
}

// Computeds for Gaming Time Quality metrics
const recentlyPlayedGames = computed(() =>
  games.value.filter((g) => g.playtime_2weeks && g.playtime_2weeks > 0),
);

const recentStoryMinutes = computed(() =>
  recentlyPlayedGames.value.reduce(
    (sum, g) =>
      getGameCategory(g) === GameTypes.Category.Story ? sum + (g.playtime_2weeks || 0) : sum,
    0,
  ),
);

const recentSessionMinutes = computed(() =>
  recentlyPlayedGames.value.reduce(
    (sum, g) =>
      getGameCategory(g) === GameTypes.Category.Session ? sum + (g.playtime_2weeks || 0) : sum,
    0,
  ),
);

const recentTotalMinutes = computed(() => recentStoryMinutes.value + recentSessionMinutes.value);

const recentStoryHours = computed(() => Math.round((recentStoryMinutes.value / 60) * 10) / 10);
const recentSessionHours = computed(() => Math.round((recentSessionMinutes.value / 60) * 10) / 10);
const recentTotalHours = computed(() => Math.round((recentTotalMinutes.value / 60) * 10) / 10);

const storyPercentage = computed(() => {
  if (recentTotalMinutes.value === 0) {
    return 0;
  }
  return Math.round((recentStoryMinutes.value / recentTotalMinutes.value) * 100);
});

const hygieneStatus = computed(() => {
  if (recentTotalHours.value < 0.5) {
    return "inactive";
  }

  // Weekly threshold is 15h of session games (which is 30h in 2 weeks as user mentioned "якщо за тиждень награв 30 годин" or "за 2 тижні")
  // Let's check if session games hours in 2 weeks >= 25 OR if story percentage is extremely low under high session hours
  if (storyPercentage.value < 20 && recentSessionHours.value >= 20) {
    return "critical";
  }
  if (storyPercentage.value < 35) {
    return "poor";
  }
  if (storyPercentage.value >= 35 && storyPercentage.value < 70) {
    return "balanced";
  }
  return "excellent";
});

const hygieneBadgeClass = computed(() => {
  switch (hygieneStatus.value) {
    case "excellent": {
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    }
    case "balanced": {
      return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20";
    }
    case "poor": {
      return "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20";
    }
    case "critical": {
      return "bg-rose-500/10 text-rose-600 dark:text-rose-500 border-rose-500/20 shadow-xs";
    }
    default: {
      return "bg-muted text-muted-foreground border-border";
    }
  }
});

const adviceBoxClass = computed(() => {
  switch (hygieneStatus.value) {
    case "excellent": {
      return "bg-emerald-500/5 border-emerald-500/10 text-emerald-800 dark:text-emerald-300";
    }
    case "balanced": {
      return "bg-cyan-500/5 border-cyan-500/10 text-cyan-800 dark:text-cyan-300";
    }
    case "poor": {
      return "bg-amber-500/5 border-amber-500/10 text-amber-800 dark:text-amber-300";
    }
    case "critical": {
      return "bg-rose-500/5 border-rose-500/10 text-rose-800 dark:text-rose-400 shadow-xs";
    }
    default: {
      return "bg-muted/10 border-border text-muted-foreground";
    }
  }
});

const detoxCardClass = computed(() => {
  switch (hygieneStatus.value) {
    case "excellent": {
      return "detox-card-excellent border-emerald-500/20";
    }
    case "balanced": {
      return "detox-card-balanced border-cyan-500/20";
    }
    case "poor": {
      return "detox-card-poor border-amber-500/20";
    }
    case "critical": {
      return "detox-card-critical border-rose-500/30";
    }
    default: {
      return "border-border/80 shadow-md";
    }
  }
});

// Roulette state variables
const showRouletteModal = ref(false);
const isSpinning = ref(false);
const candidateGames = ref<SteamGame[]>([]);
const reelGames = ref<SteamGame[]>([]);
const reelTranslateY = ref(0);
const transitionEnabled = ref(false);
const finalSelectedGame = ref<SteamGame | null>(null);

const reelStyle = computed(() => ({
  transform: `translateY(${reelTranslateY.value}px)`,
  transition: transitionEnabled.value ? "transform 3.0s cubic-bezier(0.1, 0.85, 0.25, 1)" : "none",
}));

function selectRouletteCandidates() {
  // Filter story games that have playtime between 1h (60m) and 100h (6000m)
  let candidates = games.value.filter((g) => {
    const category = getGameCategory(g);
    return (
      category === GameTypes.Category.Story &&
      g.playtime_forever >= 60 &&
      g.playtime_forever <= 6000
    );
  });

  // Fallback 1: Allow any story game with playtime >= 5 mins (started but not finished)
  if (candidates.length < 3) {
    candidates = games.value.filter((g) => {
      const category = getGameCategory(g);
      return category === GameTypes.Category.Story && g.playtime_forever >= 5;
    });
  }

  // Fallback 2: Allow any story game in the library
  if (candidates.length < 3) {
    candidates = games.value.filter((g) => getGameCategory(g) === GameTypes.Category.Story);
  }

  // Fallback 3: Allow any game at all
  if (candidates.length < 3) {
    candidates = [...games.value];
  }

  // Shuffle and grab up to 12 candidates
  const shuffled = [...candidates].sort(() => 0.5 - Math.random());
  candidateGames.value = shuffled.slice(0, Math.min(shuffled.length, 12));
}

function startRoulette() {
  if (isSpinning.value) {
    return;
  }

  selectRouletteCandidates();
  if (candidateGames.value.length === 0) {
    return;
  }

  // Build the reel tape
  const pool = candidateGames.value;
  const repeats = 6;
  const list: SteamGame[] = [];
  for (let i = 0; i < repeats; i++) {
    list.push(...pool);
  }
  reelGames.value = list;

  // Reset offset and transition
  transitionEnabled.value = false;
  reelTranslateY.value = 0;
  finalSelectedGame.value = null;
  isSpinning.value = true;
  showRouletteModal.value = true;

  // Let browser layout adjust and run the transition scroll
  setTimeout(() => {
    transitionEnabled.value = true;
    const randomIndex = Math.floor(Math.random() * pool.length);
    // Land on the second-to-last repeat block
    const targetIndex = (repeats - 2) * pool.length + randomIndex;

    // Height of each reel item is 128px (h-32 = 8rem = 128px)
    reelTranslateY.value = -(targetIndex * 128);

    setTimeout(() => {
      isSpinning.value = false;
      finalSelectedGame.value = pool[randomIndex] ?? null;
    }, 3100);
  }, 50);
}

onMounted(() => {
  loadCredentials();

  // Load manual categories from local storage
  if (import.meta.client) {
    const savedCats = localStorage.getItem("steam_game_categories");
    if (savedCats) {
      try {
        manualCategories.value = JSON.parse(savedCats);
      } catch (error) {
        console.error("Error loading manual categories:", error);
      }
    }
  }

  // Fetch games
  fetchGames();
});

async function clearSettings() {
  apiKey.value = "";
  steamId.value = "";
  await setLocale("uk");
  localStorage.removeItem("steam_api_key");
  localStorage.removeItem("steam_id");
  localStorage.removeItem("steam_language");
  games.value = [];
  totalHours.value = 0;
  totalCount.value = 0;
  loadedFromEnv.value = false;
  error.value = "";
  showSettings.value = true;
}

function handleImport(data: any) {
  if (data.steam_game_categories && typeof data.steam_game_categories === "object") {
    manualCategories.value = data.steam_game_categories;
  }
  // Reload the library after a short delay
  setTimeout(() => fetchGames(), 1000);
}

// Format numbers nicely (e.g. 1,234.5)
function formatHours(hours: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(hours);
}

// Fallback image handler in case Steam banner is missing
function handleImageError(event: Event) {
  const target = event.target as HTMLImageElement;
  if (target) {
    target.src =
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=460&h=215";
  }
}

// Compute most played game
const mostPlayedGame = computed(() => {
  if (games.value.length === 0) {
    return null;
  }
  return [...games.value].sort((a, b) => b.playtime_forever - a.playtime_forever)[0];
});

// Filter and sort games list
const filteredAndSortedGames = computed(() => {
  let list = [...games.value];

  // Apply search query
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter((game) => game.name.toLowerCase().includes(q));
  }

  // Apply sorting rules
  if (sortBy.value === "lastPlayed") {
    list.sort((a, b) => b.rtime_last_played - a.rtime_last_played);
  } else if (sortBy.value === "playtimeDesc") {
    list.sort((a, b) => b.playtime_forever - a.playtime_forever);
  } else if (sortBy.value === "playtimeAsc") {
    list.sort((a, b) => a.playtime_forever - b.playtime_forever);
  } else if (sortBy.value === "name") {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  return list;
});
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
  transition:
    transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    border-color 0.3s ease,
    box-shadow 0.3s ease;
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

/* Fade transition for modals */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
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
  0%,
  100% {
    box-shadow: 0 0 15px 1px rgba(16, 185, 129, 0.08);
    border-color: rgba(16, 185, 129, 0.2);
  }
  50% {
    box-shadow: 0 0 25px 3px rgba(16, 185, 129, 0.15);
    border-color: rgba(16, 185, 129, 0.45);
  }
}
@keyframes pulse-balanced {
  0%,
  100% {
    box-shadow: 0 0 15px 1px rgba(6, 182, 212, 0.08);
    border-color: rgba(6, 182, 212, 0.2);
  }
  50% {
    box-shadow: 0 0 25px 3px rgba(6, 182, 212, 0.15);
    border-color: rgba(6, 182, 212, 0.45);
  }
}
@keyframes pulse-poor {
  0%,
  100% {
    box-shadow: 0 0 15px 1px rgba(245, 158, 11, 0.1);
    border-color: rgba(245, 158, 11, 0.2);
  }
  50% {
    box-shadow: 0 0 25px 4px rgba(245, 158, 11, 0.18);
    border-color: rgba(245, 158, 11, 0.45);
  }
}
@keyframes pulse-critical {
  0%,
  100% {
    box-shadow: 0 0 18px 2px rgba(244, 63, 94, 0.12);
    border-color: rgba(244, 63, 94, 0.25);
  }
  50% {
    box-shadow: 0 0 28px 5px rgba(244, 63, 94, 0.24);
    border-color: rgba(244, 63, 94, 0.6);
  }
}
</style>
