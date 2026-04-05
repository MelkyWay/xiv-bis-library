<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import BisFilters from "./components/BisFilters.vue";
import BisTable from "./components/BisTable.vue";
import { CRITERION_ORDER, ULTIMATE_ORDER, UNREAL_ORDER } from "./config/encounters";
import { JOB_GROUPS_BY_ROLE, JOB_ORDER, JOB_TO_ROLE } from "./config/jobs";
import { CATEGORY_ORDER } from "./config/categories";
import { COMMUNITY_LINKS } from "./config/communityLinks";
import { ROLE_ORDER } from "./config/roles";
import {
  DEFAULT_LOCALE,
  formatHeaderUpdatedDateByLocale,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  type SupportedLocale
} from "./i18n";
import type { InfoPageContent, InfoPageKey } from "./i18n/infoMessages";
import type { BisDataFile, BisFiltersState, Category, Role } from "./types/bis";
import { getEntryKey } from "./utils/entryKey";
import { filterEntries } from "./utils/filters";
import { validateBisData } from "./utils/validators";

type Theme = "light" | "dark";

const { t, tm, locale } = useI18n();

const data = ref<BisDataFile>({ schemaVersion: 1, lastUpdated: "", entries: [] });
const loading = ref(true);
const loadError = ref<string | null>(null);
const validationWarnings = ref<string[]>([]);
const theme = ref<Theme>("light");
const favoriteEntryKeys = ref<Set<string>>(new Set());
const favoritesOnly = ref(false);

const FAVORITES_STORAGE_KEY = "favorite-entry-keys";
const THEME_TRANSITION_CLASS = "theme-transition";

const filters = ref<BisFiltersState>({
  role: "All",
  category: "All",
  job: "All",
  ultimate: "All",
  criterion: "All",
  unreal: "All",
  query: ""
});

const groupedJobs = computed<Array<{ role: Role; label: string; jobs: string[] }>>(() => {
  const roleLabels: Record<Role, string> = {
    Healer: t("filters.roleGroups.Healer"),
    Tank: t("filters.roleGroups.Tank"),
    Melee: t("filters.roleGroups.Melee"),
    "Physical Ranged": t("filters.roleGroups.Physical Ranged"),
    "Magical Ranged": t("filters.roleGroups.Magical Ranged"),
    Limited: t("filters.roleGroups.Limited")
  };

  return JOB_GROUPS_BY_ROLE.map((group) => ({
    role: group.role,
    label: roleLabels[group.role],
    jobs: [...group.jobs]
  }));
});

const ultimates = computed(() => {
  return [...ULTIMATE_ORDER];
});

const criterions = computed(() => {
  return [...CRITERION_ORDER];
});

const unreals = computed(() => {
  return [...UNREAL_ORDER];
});

const roleByJob: Record<string, Role> = { ...JOB_TO_ROLE };
const knownJobs = new Set<string>(JOB_ORDER);

const filtered = computed(() => {
  const base = filterEntries(data.value.entries, filters.value, {
    ultimateOrder: ultimates.value,
    criterionOrder: criterions.value,
    categoryOrder: CATEGORY_ORDER,
    jobOrder: [...JOB_ORDER]
  });

  if (!favoritesOnly.value) {
    return base;
  }

  return base.filter((entry) => favoriteEntryKeys.value.has(getEntryKey(entry)));
});
const activeEncounterFilter = computed(() => {
  if (filters.value.category === "Ultimate") {
    return filters.value.ultimate;
  }
  if (filters.value.category === "Criterion") {
    return filters.value.criterion;
  }
  if (filters.value.category === "Unreal") {
    return filters.value.unreal;
  }
  return "All";
});
const hasHydratedFiltersFromUrl = ref(false);
const brandLogoSrc = `${import.meta.env.BASE_URL}brand-logo.png`;
const themeSunIconSrc = `${import.meta.env.BASE_URL}icon-sun.svg`;
const themeMoonIconSrc = `${import.meta.env.BASE_URL}icon-moon.svg`;
const deployedAtRaw = String(import.meta.env.VITE_DEPLOYED_AT ?? "").trim();
const activeInfoPage = ref<InfoPageKey | null>(null);
const LOCALE_LABEL: Record<SupportedLocale, string> = {
  en: "English",
  fr: "Français",
  de: "Deutsch",
  ja: "日本語",
  ko: "한국어",
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文"
};

const localeOptions = computed(() =>
  SUPPORTED_LOCALES.map((code) => ({ code, label: LOCALE_LABEL[code] }))
);

function formatHeaderUpdatedDate(rawValue: string): string {
  return formatHeaderUpdatedDateByLocale(rawValue, String(locale.value));
}

const headerUpdatedValue = computed(() => {
  const rawValue = deployedAtRaw || data.value.lastUpdated;
  if (!rawValue) {
    return t("app.notAvailable");
  }

  return formatHeaderUpdatedDate(rawValue);
});
const activeInfoContent = computed<InfoPageContent | null>(() =>
  activeInfoPage.value ? (tm(`info.pages.${activeInfoPage.value}`) as InfoPageContent) : null
);

const KNOWN_ROLES = new Set<Role>(ROLE_ORDER);
const KNOWN_CATEGORIES = new Set<Category>(CATEGORY_ORDER);

function buildNextUrl(params: URLSearchParams): string {
  const windowRef = globalThis.window;
  const nextQuery = params.toString();
  const queryPart = nextQuery ? `?${nextQuery}` : "";
  return `${windowRef.location.pathname}${queryPart}${windowRef.location.hash}`;
}

function parseFiltersFromUrl(): Partial<BisFiltersState> {
  if (globalThis.window === undefined) {
    return {};
  }

  const params = new URLSearchParams(globalThis.window.location.search);
  const next: Partial<BisFiltersState> = {};

  const role = params.get("role");
  if (role === "All" || (role && KNOWN_ROLES.has(role as Role))) {
    next.role = role as BisFiltersState["role"];
  }

  const category = params.get("category");
  if (category === "All" || (category && KNOWN_CATEGORIES.has(category as Category))) {
    next.category = category as BisFiltersState["category"];
  }

  const job = params.get("job");
  if (job && (job === "All" || knownJobs.has(job))) {
    next.job = job;
  }

  const ultimate = params.get("ultimate");
  if (ultimate) {
    next.ultimate = ultimate;
  }

  const criterion = params.get("criterion");
  if (criterion) {
    next.criterion = criterion;
  }

  const unreal = params.get("unreal");
  if (unreal) {
    next.unreal = unreal;
  }

  const query = params.get("q");
  if (query !== null) {
    next.query = query;
  }

  return next;
}

function normalizeLocaleCode(value: string | null): SupportedLocale | null {
  if (!value) {
    return null;
  }

  const normalized = value.toLowerCase();
  if (normalized === "zh" || normalized === "zh-cn" || normalized === "zh-hans" || normalized.startsWith("zh-cn-")) {
    return "zh-CN";
  }
  if (normalized === "zh-tw" || normalized === "zh-hant" || normalized.startsWith("zh-tw-")) {
    return "zh-TW";
  }

  const exact = SUPPORTED_LOCALES.find((code) => code.toLowerCase() === normalized);
  return exact ?? null;
}

function parseLocaleFromUrl(): SupportedLocale | null {
  if (globalThis.window === undefined) {
    return null;
  }

  const lang = new URLSearchParams(globalThis.window.location.search).get("lang");
  return normalizeLocaleCode(lang);
}

function resolveInitialLocale(): SupportedLocale {
  const fromUrl = parseLocaleFromUrl();
  if (fromUrl) {
    return fromUrl;
  }

  const fromStorage = localStorage.getItem(LOCALE_STORAGE_KEY);
  const normalizedFromStorage = normalizeLocaleCode(fromStorage);
  if (normalizedFromStorage) {
    return normalizedFromStorage;
  }

  const browserLocale = navigator.language.toLowerCase();
  const normalizedBrowserLocale = normalizeLocaleCode(browserLocale);
  if (normalizedBrowserLocale) {
    return normalizedBrowserLocale;
  }

  const base = browserLocale.split("-")[0];
  return normalizeLocaleCode(base) ?? DEFAULT_LOCALE;
}

function syncFiltersToUrl(nextFilters: BisFiltersState): void {
  if (globalThis.window === undefined) {
    return;
  }

  const params = new URLSearchParams(globalThis.window.location.search);

  const setOrDelete = (key: string, value: string, defaultValue = "All"): void => {
    if (!value || value === defaultValue) {
      params.delete(key);
      return;
    }
    params.set(key, value);
  };

  setOrDelete("job", nextFilters.job);
  setOrDelete("role", nextFilters.role);
  setOrDelete("category", nextFilters.category);
  setOrDelete("ultimate", nextFilters.ultimate);
  setOrDelete("criterion", nextFilters.criterion);
  setOrDelete("unreal", nextFilters.unreal);

  if (nextFilters.query.trim()) {
    params.set("q", nextFilters.query);
  } else {
    params.delete("q");
  }

  const nextUrl = buildNextUrl(params);
  globalThis.window.history.replaceState({}, "", nextUrl);
}

function syncLocaleToUrl(nextLocale: SupportedLocale): void {
  if (globalThis.window === undefined) {
    return;
  }

  const params = new URLSearchParams(globalThis.window.location.search);

  if (nextLocale === DEFAULT_LOCALE) {
    params.delete("lang");
  } else {
    params.set("lang", nextLocale);
  }

  const nextUrl = buildNextUrl(params);
  globalThis.window.history.replaceState({}, "", nextUrl);
}

function setLocale(nextLocale: SupportedLocale): void {
  locale.value = nextLocale;
  document.documentElement.lang = nextLocale;
  localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
}

function updateFilters(next: BisFiltersState): void {
  const previousFilters = filters.value;
  const nextFilters = { ...next };

  const roleChanged = nextFilters.role !== previousFilters.role;
  const jobChanged = nextFilters.job !== previousFilters.job;
  const categoryChanged = nextFilters.category !== previousFilters.category;

  if (roleChanged && !jobChanged && nextFilters.job !== "All") {
    const selectedJobRole = roleByJob[nextFilters.job];
    if (selectedJobRole && nextFilters.role !== selectedJobRole) {
      nextFilters.job = "All";
    }
  }

  if (nextFilters.job !== "All") {
    const jobRole = roleByJob[nextFilters.job];
    if (jobRole) {
      nextFilters.role = jobRole;
    } else {
      nextFilters.job = "All";
    }
  }

  if (nextFilters.category !== "Ultimate") {
    nextFilters.ultimate = "All";
  }

  if (nextFilters.category !== "Criterion") {
    nextFilters.criterion = "All";
  }

  if (nextFilters.category !== "Unreal") {
    nextFilters.unreal = "All";
  } else if (categoryChanged && previousFilters.category !== "Unreal") {
    nextFilters.unreal = unreals.value[0] ?? "All";
  } else if (nextFilters.unreal === "All" && unreals.value.length > 0) {
    nextFilters.unreal = unreals.value[0];
  }

  filters.value = nextFilters;
}

function loadFavoritesFromStorage(): void {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) {
      favoriteEntryKeys.value = new Set();
      return;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      favoriteEntryKeys.value = new Set();
      return;
    }

    favoriteEntryKeys.value = new Set(parsed.filter((value): value is string => typeof value === "string"));
  } catch {
    favoriteEntryKeys.value = new Set();
  }
}

function persistFavorites(next: Set<string>): void {
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...next]));
}

function toggleFavorite(entry: BisDataFile["entries"][number]): void {
  const key = getEntryKey(entry);
  const next = new Set(favoriteEntryKeys.value);
  if (next.has(key)) {
    next.delete(key);
  } else {
    next.add(key);
  }
  favoriteEntryKeys.value = next;
  persistFavorites(next);
}

function toggleFavoritesOnly(): void {
  favoritesOnly.value = !favoritesOnly.value;
}

function hydrateFiltersFromUrl(): void {
  const parsed = parseFiltersFromUrl();

  if (Object.keys(parsed).length > 0) {
    updateFilters({ ...filters.value, ...parsed });
  }

  hasHydratedFiltersFromUrl.value = true;
}

async function loadData(): Promise<void> {
  try {
    loading.value = true;
    const url = `${import.meta.env.BASE_URL}data/bis-links.json`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to load data (${response.status})`);
    }

    const raw = await response.json();
    const result = validateBisData(raw);

    validationWarnings.value = result.errors;

    if (!result.data) {
      throw new Error("Data file failed validation.");
    }

    data.value = result.data;
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : "Unknown loading error.";
  } finally {
    loading.value = false;
  }
}

function applyTheme(nextTheme: Theme, animate = true): void {
  const shouldAnimate =
    animate && !(globalThis.window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);

  if (shouldAnimate) {
    document.documentElement.classList.add(THEME_TRANSITION_CLASS);
    globalThis.window.setTimeout(() => {
      document.documentElement.classList.remove(THEME_TRANSITION_CLASS);
    }, 300);
  }

  theme.value = nextTheme;
  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem("theme", nextTheme);
}

function toggleTheme(): void {
  applyTheme(theme.value === "light" ? "dark" : "light");
}

function onLocaleChange(value: string): void {
  const normalized = normalizeLocaleCode(value);
  if (!normalized) {
    return;
  }
  setLocale(normalized);
  syncLocaleToUrl(normalized);
}

function openInfoPage(page: InfoPageKey): void {
  activeInfoPage.value = page;
}

function closeInfoPage(): void {
  activeInfoPage.value = null;
}

function handlePopState(): void {
  const localeFromUrl = parseLocaleFromUrl() ?? DEFAULT_LOCALE;
  setLocale(localeFromUrl);

  const parsed = parseFiltersFromUrl();
  updateFilters({
    role: "All",
    category: "All",
    job: "All",
    ultimate: "All",
    criterion: "All",
    unreal: "All",
    query: "",
    ...parsed
  });
}

onMounted(async () => {
  loadFavoritesFromStorage();
  setLocale(resolveInitialLocale());
  syncLocaleToUrl(locale.value as SupportedLocale);

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light" || savedTheme === "dark") {
    applyTheme(savedTheme, false);
  } else {
    const prefersDark = globalThis.window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
    applyTheme(prefersDark ? "dark" : "light", false);
  }

  await loadData();
  hydrateFiltersFromUrl();
  globalThis.window.addEventListener("popstate", handlePopState);
});

onBeforeUnmount(() => {
  globalThis.window.removeEventListener("popstate", handlePopState);
});

watch(
  filters,
  (nextFilters) => {
    if (!hasHydratedFiltersFromUrl.value) {
      return;
    }
    syncFiltersToUrl(nextFilters);
  },
  { deep: true }
);

watch(locale, (nextLocale) => {
  document.documentElement.lang = String(nextLocale);
});

watch(unreals, () => {
  if (filters.value.category !== "Unreal") {
    return;
  }

  if (filters.value.unreal === "All" && unreals.value.length > 0) {
    updateFilters({ ...filters.value, unreal: unreals.value[0] });
  }
});
</script>

<template>
  <main class="app-shell">
    <header>
      <div class="header-top">
        <h1 class="brand-title">
          <img class="brand-logo" :src="brandLogoSrc" alt="XIV BiS Library logo" />
          <span class="brand-title-text">
            <span class="brand-title-main">XIV BiS</span>
            <span class="brand-title-sub">— LIBRARY —</span>
          </span>
        </h1>
        <p class="header-subtitle">{{ t("app.subtitle") }}</p>
      </div>
      <div class="header-meta-row">
        <p class="meta">{{ t("app.lastUpdated", { date: headerUpdatedValue }) }}</p>
        <div class="header-controls">
          <a
            class="discord-link"
            :href="COMMUNITY_LINKS.discordInviteUrl"
            target="_blank"
            rel="noreferrer"
            :aria-label="t('app.discordButton')"
            :title="t('app.discordButton')"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M19.5 5.4c-1.2-.55-2.5-.95-3.9-1.15l-.17.33c1.15.27 1.87.65 2.72 1.17a15 15 0 0 0-8.28 0c.85-.52 1.57-.9 2.72-1.17l-.17-.33c-1.4.2-2.7.6-3.9 1.15C4 8.4 3.46 11.35 3.7 14.25c1.47 1.1 2.89 1.77 4.29 2.2.35-.48.66-.99.92-1.54-.5-.19-.98-.42-1.45-.7l.36-.28c2.79 1.29 5.81 1.29 8.57 0l.36.28c-.47.28-.95.51-1.45.7.26.55.57 1.06.92 1.54 1.4-.43 2.82-1.1 4.29-2.2.31-3.38-.53-6.31-2.11-8.85Zm-10.15 7.1c-.72 0-1.31-.66-1.31-1.47 0-.82.58-1.48 1.31-1.48.74 0 1.33.67 1.31 1.48 0 .82-.58 1.47-1.31 1.47Zm5.3 0c-.72 0-1.31-.66-1.31-1.47 0-.82.58-1.48 1.31-1.48.74 0 1.33.67 1.31 1.48 0 .82-.57 1.47-1.31 1.47Z"
                fill="currentColor"
              />
            </svg>
            <span class="sr-only">{{ t("common.discord") }}</span>
          </a>
          <a
            class="social-link contribute-link"
            :href="COMMUNITY_LINKS.contributingGuideUrl"
            target="_blank"
            rel="noreferrer"
            :aria-label="t('app.contributeButton')"
            :title="t('app.contributeButton')"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                fill="currentColor"
                d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.86 8.17 6.84 9.49.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.71-2.78.61-3.37-1.34-3.37-1.34-.45-1.14-1.1-1.44-1.1-1.44-.9-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.93 0-1.09.39-1.98 1.03-2.68-.1-.26-.45-1.31.1-2.72 0 0 .84-.27 2.75 1.02a9.57 9.57 0 0 1 2.5-.34c.85 0 1.7.12 2.5.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.41.2 2.46.1 2.72.64.7 1.03 1.59 1.03 2.68 0 3.83-2.34 4.68-4.57 4.93.36.31.68.91.68 1.84 0 1.33-.01 2.4-.01 2.73 0 .26.18.57.69.48A10.01 10.01 0 0 0 22 12c0-5.52-4.48-10-10-10Z"
              />
            </svg>
            <span>{{ t("common.contribute") }}</span>
          </a>
          <label class="locale-picker">
            <span class="sr-only">{{ t("common.locale") }}</span>
            <select :value="locale" @change="onLocaleChange(($event.target as HTMLSelectElement).value)">
              <option v-for="option in localeOptions" :key="option.code" :value="option.code">{{ option.label }}</option>
            </select>
          </label>
          <button
            class="theme-switch"
            :class="{ dark: theme === 'dark' }"
            type="button"
            :aria-label="t('app.themeSwitch', { theme: theme === 'light' ? t('common.dark') : t('common.light') })"
            :title="t('app.themeSwitch', { theme: theme === 'light' ? t('common.dark') : t('common.light') })"
            @click="toggleTheme"
          >
            <span class="theme-track-icon sun" aria-hidden="true"><img :src="themeSunIconSrc" alt="" /></span>
            <span class="theme-track-icon moon" aria-hidden="true"><img :src="themeMoonIconSrc" alt="" /></span>
            <span class="theme-thumb" aria-hidden="true">
              <img :src="theme === 'dark' ? themeMoonIconSrc : themeSunIconSrc" alt="" class="theme-thumb-icon" />
            </span>
          </button>
        </div>
      </div>
    </header>

    <p v-if="loading" class="panel">{{ t("app.loading") }}</p>
    <p v-else-if="loadError" class="panel error">{{ loadError }}</p>

    <template v-else>
      <BisFilters
        :filters="filters"
        :grouped-jobs="groupedJobs"
        :ultimates="ultimates"
        :criterions="criterions"
        :unreals="unreals"
        :role-by-job="roleByJob"
        :favorites-only="favoritesOnly"
        @update:filters="updateFilters"
        @toggle:favorites-only="toggleFavoritesOnly"
      />
      <BisTable
        :rows="filtered"
        :active-category="filters.category"
        :active-encounter="activeEncounterFilter"
        :favorite-entry-keys="favoriteEntryKeys"
        @toggle-favorite="toggleFavorite"
      />

      <section v-if="validationWarnings.length" class="panel warning">
        <h2>{{ t("app.validationWarnings") }}</h2>
        <ul>
          <li v-for="warning in validationWarnings" :key="warning">{{ warning }}</li>
        </ul>
      </section>
    </template>

    <section v-if="activeInfoContent" class="panel info-panel" :aria-label="t('info.ariaPanel')">
      <div class="info-panel-header">
        <h2>{{ activeInfoContent.title }}</h2>
        <button type="button" class="info-panel-close" @click="closeInfoPage">{{ t("info.close") }}</button>
      </div>
      <p>{{ activeInfoContent.intro }}</p>
      <section v-for="section in activeInfoContent.sections" :key="section.title" class="info-panel-section">
        <h3>{{ section.title }}</h3>
        <p v-for="paragraph in section.paragraphs ?? []" :key="paragraph">{{ paragraph }}</p>
        <ul v-if="section.bullets?.length">
          <li v-for="bullet in section.bullets" :key="bullet">{{ bullet }}</li>
        </ul>
      </section>
      <section v-if="activeInfoPage === 'contact'" class="info-panel-section">
        <h3>{{ t("common.communityLinks") }}</h3>
        <div class="info-panel-links">
          <a :href="COMMUNITY_LINKS.discordInviteUrl" target="_blank" rel="noreferrer">
            {{ t("common.discord") }}
          </a>
          <a :href="COMMUNITY_LINKS.githubRepoUrl" target="_blank" rel="noreferrer">
            {{ t("common.github") }}
          </a>
          <a :href="COMMUNITY_LINKS.contributingGuideUrl" target="_blank" rel="noreferrer">
            {{ t("common.contribute") }}
          </a>
        </div>
      </section>
    </section>

    <footer class="site-footer" :aria-label="t('info.ariaFooter')">
      <nav class="footer-nav">
        <a href="#" @click.prevent="closeInfoPage">{{ t("info.footer.home") }}</a>
        <a href="#" @click.prevent="openInfoPage('about')">{{ t("info.footer.about") }}</a>
        <a href="#" @click.prevent="openInfoPage('dataDisclaimer')">{{ t("info.footer.dataDisclaimer") }}</a>
        <a href="#" @click.prevent="openInfoPage('privacy')">{{ t("info.footer.privacy") }}</a>
        <a href="#" @click.prevent="openInfoPage('contact')">{{ t("info.footer.contact") }}</a>
        <a :href="COMMUNITY_LINKS.contributingGuideUrl" target="_blank" rel="noreferrer">
          {{ t("common.contribute") }}
        </a>
        <a href="#" @click.prevent="openInfoPage('legal')">{{ t("info.footer.legal") }}</a>
      </nav>
    </footer>
  </main>
</template>


