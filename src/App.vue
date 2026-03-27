<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import BisFilters from "./components/BisFilters.vue";
import BisTable from "./components/BisTable.vue";
import { CATEGORY_ORDER, CRITERION_ORDER, ULTIMATE_ORDER } from "./config/orders";
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, SUPPORTED_LOCALES, type SupportedLocale } from "./i18n";
import type { BisDataFile, BisFiltersState, Category, Role } from "./types/bis";
import { getEntryKey } from "./utils/entryKey";
import { filterEntries } from "./utils/filters";
import { validateBisData } from "./utils/validators";

type Theme = "light" | "dark";
const { t, locale } = useI18n();

const data = ref<BisDataFile>({ lastUpdated: "", entries: [] });
const loading = ref(true);
const loadError = ref<string | null>(null);
const validationWarnings = ref<string[]>([]);
const theme = ref<Theme>("light");
const favoriteEntryKeys = ref<Set<string>>(new Set());
const favoritesOnly = ref(false);

const FAVORITES_STORAGE_KEY = "favorite-entry-keys";

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

  const roleOrder: Role[] = ["Tank", "Healer", "Melee", "Physical Ranged", "Magical Ranged", "Limited"];
  const jobsByRole = new Map<Role, Set<string>>();

  for (const role of roleOrder) {
    jobsByRole.set(role, new Set<string>());
  }

  for (const entry of data.value.entries) {
    jobsByRole.get(entry.role)?.add(entry.job);
  }

  return roleOrder
    .map((role) => ({
      role,
      label: roleLabels[role],
      jobs: [...(jobsByRole.get(role) ?? new Set<string>())].sort((a, b) => a.localeCompare(b))
    }))
    .filter((group) => group.jobs.length > 0);
});

const jobOrder = computed(() => groupedJobs.value.flatMap((group) => group.jobs));

function sortByConfiguredOrder(values: string[], order: readonly string[]): string[] {
  const orderIndex = new Map(order.map((name, index) => [name, index]));
  return [...values].sort((a, b) => {
    const aIndex = orderIndex.get(a);
    const bIndex = orderIndex.get(b);
    if (aIndex !== undefined && bIndex !== undefined) return aIndex - bIndex;
    if (aIndex !== undefined) return -1;
    if (bIndex !== undefined) return 1;
    return a.localeCompare(b);
  });
}

const ultimates = computed(() => {
  const names = data.value.ultimateNames?.length
    ? [...new Set(data.value.ultimateNames)]
    : [
        ...new Set(
          data.value.entries
            .filter((entry) => entry.category === "Ultimate" && entry.ultimate)
            .map((entry) => entry.ultimate as string)
        )
      ];

  return sortByConfiguredOrder(names, ULTIMATE_ORDER);
});

const criterions = computed(() => {
  if (data.value.criterionNames?.length) {
    const names = [...new Set(data.value.criterionNames ?? [])];
    return sortByConfiguredOrder(names, CRITERION_ORDER);
  }

  const names = [
    ...new Set(
      data.value.entries
        .filter((entry) => entry.category === "Criterion" && entry.criterionName)
        .map((entry) => entry.criterionName as string)
    )
  ];
  return sortByConfiguredOrder(names, CRITERION_ORDER);
});

const unreals = computed(() => {
  if (data.value.unrealNames?.length) {
    return [...new Set(data.value.unrealNames)].sort((a, b) => a.localeCompare(b));
  }

  return [
    ...new Set(
      data.value.entries
        .filter((entry) => entry.category === "Unreal" && entry.unrealName)
        .map((entry) => entry.unrealName as string)
    )
  ].sort((a, b) => a.localeCompare(b));
});

const roleByJob = computed<Record<string, Role>>(() => {
  const map: Record<string, Role> = {};
  for (const entry of data.value.entries) {
    if (!map[entry.job]) {
      map[entry.job] = entry.role;
    }
  }
  return map;
});
const knownJobs = computed<Set<string>>(() => new Set(data.value.entries.map((entry) => entry.job)));

const filtered = computed(() => {
  const base = filterEntries(data.value.entries, filters.value, {
    ultimateOrder: ultimates.value,
    criterionOrder: criterions.value,
    categoryOrder: CATEGORY_ORDER,
    jobOrder: jobOrder.value
  });

  if (!favoritesOnly.value) {
    return base;
  }

  return base.filter((entry) => favoriteEntryKeys.value.has(getEntryKey(entry)));
});
const hasHydratedFiltersFromUrl = ref(false);
const LOCALE_LABEL: Record<SupportedLocale, string> = {
  en: "English",
  fr: "Français",
  de: "Deutsch",
  ja: "日本語",
  ko: "한국어",
  zh: "中文"
};

const localeOptions = computed(() =>
  SUPPORTED_LOCALES.map((code) => ({ code, label: LOCALE_LABEL[code] }))
);

const KNOWN_ROLES: Role[] = ["Tank", "Healer", "Melee", "Physical Ranged", "Magical Ranged", "Limited"];
const KNOWN_CATEGORIES: Category[] = [...CATEGORY_ORDER];

function parseFiltersFromUrl(): Partial<BisFiltersState> {
  if (typeof window === "undefined") {
    return {};
  }

  const params = new URLSearchParams(window.location.search);
  const next: Partial<BisFiltersState> = {};

  const role = params.get("role");
  if (role === "All" || (role && KNOWN_ROLES.includes(role as Role))) {
    next.role = role as BisFiltersState["role"];
  }

  const category = params.get("category");
  if (category === "All" || (category && KNOWN_CATEGORIES.includes(category as Category))) {
    next.category = category as BisFiltersState["category"];
  }

  const job = params.get("job");
  if (job && (job === "All" || knownJobs.value.has(job))) {
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

function parseLocaleFromUrl(): SupportedLocale | null {
  if (typeof window === "undefined") {
    return null;
  }

  const lang = new URLSearchParams(window.location.search).get("lang");
  if (lang && SUPPORTED_LOCALES.includes(lang as SupportedLocale)) {
    return lang as SupportedLocale;
  }
  return null;
}

function resolveInitialLocale(): SupportedLocale {
  const fromUrl = parseLocaleFromUrl();
  if (fromUrl) {
    return fromUrl;
  }

  const fromStorage = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (fromStorage && SUPPORTED_LOCALES.includes(fromStorage as SupportedLocale)) {
    return fromStorage as SupportedLocale;
  }

  const browserLocale = navigator.language.toLowerCase();
  const matched = SUPPORTED_LOCALES.find((code) => browserLocale === code || browserLocale.startsWith(`${code}-`));
  return matched ?? DEFAULT_LOCALE;
}

function syncFiltersToUrl(nextFilters: BisFiltersState): void {
  if (typeof window === "undefined") {
    return;
  }

  const params = new URLSearchParams(window.location.search);

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

  const nextQuery = params.toString();
  const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}${window.location.hash}`;
  window.history.replaceState({}, "", nextUrl);
}

function syncLocaleToUrl(nextLocale: SupportedLocale): void {
  if (typeof window === "undefined") {
    return;
  }

  const params = new URLSearchParams(window.location.search);

  if (nextLocale === DEFAULT_LOCALE) {
    params.delete("lang");
  } else {
    params.set("lang", nextLocale);
  }

  const nextQuery = params.toString();
  const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}${window.location.hash}`;
  window.history.replaceState({}, "", nextUrl);
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
    const selectedJobRole = roleByJob.value[nextFilters.job];
    if (selectedJobRole && nextFilters.role !== selectedJobRole) {
      nextFilters.job = "All";
    }
  }

  if (nextFilters.job !== "All") {
    const jobRole = roleByJob.value[nextFilters.job];
    if (!jobRole) {
      nextFilters.job = "All";
    } else {
      nextFilters.role = jobRole;
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

function applyTheme(nextTheme: Theme): void {
  theme.value = nextTheme;
  document.documentElement.setAttribute("data-theme", nextTheme);
  localStorage.setItem("theme", nextTheme);
}

function toggleTheme(): void {
  applyTheme(theme.value === "light" ? "dark" : "light");
}

function onLocaleChange(value: string): void {
  if (!SUPPORTED_LOCALES.includes(value as SupportedLocale)) {
    return;
  }
  setLocale(value as SupportedLocale);
  syncLocaleToUrl(value as SupportedLocale);
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
    applyTheme(savedTheme);
  } else {
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
    applyTheme(prefersDark ? "dark" : "light");
  }

  await loadData();
  hydrateFiltersFromUrl();
  window.addEventListener("popstate", handlePopState);
});

onBeforeUnmount(() => {
  window.removeEventListener("popstate", handlePopState);
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
      <h1>{{ t("app.title") }}</h1>
      <p>{{ t("app.subtitle") }}</p>
      <div class="header-meta-row">
        <p class="meta" v-if="data.lastUpdated">{{ t("app.lastUpdated", { date: data.lastUpdated }) }}</p>
        <p class="meta" v-else>{{ t("app.lastUpdated", { date: t("app.notAvailable") }) }}</p>
        <div class="header-controls">
          <label class="locale-picker">
            <span class="sr-only">{{ t("common.locale") }}</span>
            <select :value="locale" @change="onLocaleChange(($event.target as HTMLSelectElement).value)">
              <option v-for="option in localeOptions" :key="option.code" :value="option.code">{{ option.label }}</option>
            </select>
          </label>
          <button class="theme-toggle" type="button" @click="toggleTheme">
            {{ t("app.themeSwitch", { theme: theme === "light" ? t("common.dark") : t("common.light") }) }}
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
  </main>
</template>

