<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import BisFilters from "./components/BisFilters.vue";
import BisTable from "./components/BisTable.vue";
import { CRITERION_ORDER, ULTIMATE_ORDER, UNREAL_ORDER } from "./config/encounters";
import { JOB_ORDER, JOB_TO_ROLE } from "./config/jobs";
import { JOB_GROUPS_BY_ROLE } from "./config/options";
import { CATEGORY_ORDER } from "./config/orders";
import { ROLE_ORDER } from "./config/roles";
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, SUPPORTED_LOCALES, type SupportedLocale } from "./i18n";
import type { InfoPageContent, InfoPageKey } from "./locales/infoMessages";
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
const headerUpdatedValue = computed(() => deployedAtRaw || data.value.lastUpdated || t("app.notAvailable"));
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
    </section>

    <footer class="site-footer" :aria-label="t('info.ariaFooter')">
      <nav class="footer-nav">
        <a href="#" @click.prevent="closeInfoPage">{{ t("info.footer.home") }}</a>
        <a href="#" @click.prevent="openInfoPage('about')">{{ t("info.footer.about") }}</a>
        <a href="#" @click.prevent="openInfoPage('dataDisclaimer')">{{ t("info.footer.dataDisclaimer") }}</a>
        <a href="#" @click.prevent="openInfoPage('privacy')">{{ t("info.footer.privacy") }}</a>
        <a href="#" @click.prevent="openInfoPage('contact')">{{ t("info.footer.contact") }}</a>
        <a href="#" @click.prevent="openInfoPage('legal')">{{ t("info.footer.legal") }}</a>
      </nav>
    </footer>
  </main>
</template>


