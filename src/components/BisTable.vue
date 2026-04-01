<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { BisEntry, BisFiltersState, Role } from "../types/bis";
import { getEntryKey } from "../utils/entryKey";
import { localizeJobName } from "../utils/jobLocalization";
import { localizeUltimateName } from "../utils/ultimateLocalization";
const { t, locale } = useI18n();

const props = defineProps<{
  rows: BisEntry[];
  activeCategory: BisFiltersState["category"];
  favoriteEntryKeys: Set<string>;
}>();
const emit = defineEmits<(event: "toggle-favorite", entry: BisEntry) => void>();

type SortDirection = "desc" | "asc";
type SortKey = "damage";
type SortValue = string | number | null;

type SortConfig = {
  getValue: (row: BisEntry) => SortValue;
  defaultDirection: SortDirection;
  nullsLast?: boolean;
};

const sortState = ref<{ key: SortKey | null; direction: SortDirection | null }>({
  key: null,
  direction: null
});
const PAGE_SIZE = 100;
const currentPage = ref(1);

const infoHeaderLabel = computed(() => {
  if (props.activeCategory === "Ultimate" || props.activeCategory === "Criterion" || props.activeCategory === "Unreal") {
    return t("table.encounter");
  }

  if (
    props.activeCategory === "Savage" ||
    props.activeCategory === "Occult Crescent" ||
    props.activeCategory === "Eureka" ||
    props.activeCategory === "Prog"
  ) {
    return t("table.tier");
  }

  return t("table.info");
});

const showCategoryColumn = computed(() => props.activeCategory === "All");
const emptyStateColspan = computed(() => (showCategoryColumn.value ? 9 : 8));

function roleStyle(role: Role): Record<string, string> {
  if (role === "Tank") return { color: "var(--role-tank)" };
  if (role === "Healer") return { color: "var(--role-healer)" };
  if (role === "Melee") return { color: "var(--role-melee)" };
  if (role === "Magical Ranged") return { color: "var(--role-magical)" };
  if (role === "Physical Ranged") return { color: "var(--role-physical)" };
  return { color: "var(--color-text)" };
}

function infoValue(row: BisEntry): string {
  if (row.category === "Ultimate") {
    return row.ultimate ? localizeUltimateName(row.ultimate, String(locale.value)) : "-";
  }
  if (row.category === "Criterion") return row.criterionName ?? "-";
  if (row.category === "Unreal") return row.unrealName ?? "-";
  if (row.category === "Other") return row.otherName ?? "-";
  return row.tier;
}

function parseDamage(value: string | undefined): number | null {
  if (!value || value === "-") {
    return null;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

const SORT_CONFIGS: Record<SortKey, SortConfig> = {
  damage: {
    getValue: (row) => parseDamage(row.damage?.value),
    defaultDirection: "desc",
    nullsLast: true
  }
};

function toggleSort(key: SortKey): void {
  if (sortState.value.key !== key || sortState.value.direction === null) {
    sortState.value = { key, direction: SORT_CONFIGS[key].defaultDirection };
    return;
  }

  if (sortState.value.direction === "desc") {
    sortState.value = { key, direction: "asc" };
    return;
  }

  sortState.value = { key: null, direction: null };
}

function sortIndicator(key: SortKey): string {
  if (sortState.value.key !== key || sortState.value.direction === null) {
    return "";
  }

  return sortState.value.direction === "desc" ? "v" : "^";
}

function sortAriaLabel(key: SortKey, label: string): string {
  const isActive = sortState.value.key === key && sortState.value.direction !== null;
  let current = t("table.sortCurrent.none");
  if (isActive) {
    current = sortState.value.direction === "asc" ? t("table.sortCurrent.asc") : t("table.sortCurrent.desc");
  }
  const next = !isActive || sortState.value.direction === "asc" ? t("table.sortNext.desc") : t("table.sortNext.asc");
  return t("table.sortLabel", { label, current, next });
}

function sortAriaSort(key: SortKey): "ascending" | "descending" | "none" {
  if (sortState.value.key !== key || sortState.value.direction === null) {
    return "none";
  }

  return sortState.value.direction === "asc" ? "ascending" : "descending";
}

function hasDamageValue(row: BisEntry): boolean {
  return !!row.damage?.value && row.damage.value !== "-";
}

function damageType(row: BisEntry): "sim" | "potency" | null {
  if (!hasDamageValue(row)) {
    return null;
  }

  if (row.damage?.type === "potency") {
    return "potency";
  }

  if (row.damage?.type === "none") {
    return null;
  }

  return "sim";
}

function damageSubscriptLabel(row: BisEntry): string {
  return damageType(row) === "potency" ? "P" : "S";
}

function damageSubscriptTooltip(row: BisEntry): string {
  return damageType(row) === "potency" ? t("table.damageTypePotency") : t("table.damageTypeSim");
}

function roleLabel(role: Role): string {
  return t(`filters.roles.${role}`);
}

function categoryLabel(category: BisEntry["category"]): string {
  return t(`filters.categories.${category}`);
}

function jobLabel(job: string): string {
  return localizeJobName(job, String(locale.value));
}

function compareSortValues(a: SortValue, b: SortValue, nullsLast: boolean): number {
  if (a === null && b === null) return 0;
  if (a === null) return nullsLast ? 1 : -1;
  if (b === null) return nullsLast ? -1 : 1;

  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }

  return String(a).localeCompare(String(b));
}

const displayRows = computed(() => {
  const { key, direction } = sortState.value;
  if (!key || !direction) {
    return props.rows;
  }

  const config = SORT_CONFIGS[key];
  const sorted = [...props.rows];
  sorted.sort((a, b) => {
    const compared = compareSortValues(config.getValue(a), config.getValue(b), config.nullsLast ?? true);
    return direction === "desc" ? -compared : compared;
  });

  return sorted;
});

const totalRows = computed(() => displayRows.value.length);
const totalPages = computed(() => Math.max(1, Math.ceil(totalRows.value / PAGE_SIZE)));
const pageStartIndex = computed(() => (currentPage.value - 1) * PAGE_SIZE);
const paginatedRows = computed(() => displayRows.value.slice(pageStartIndex.value, pageStartIndex.value + PAGE_SIZE));
const pageFrom = computed(() => (totalRows.value === 0 ? 0 : pageStartIndex.value + 1));
const pageTo = computed(() => Math.min(pageStartIndex.value + PAGE_SIZE, totalRows.value));

watch(
  () => props.rows,
  () => {
    currentPage.value = 1;
  }
);

watch(totalPages, (nextTotalPages) => {
  if (currentPage.value > nextTotalPages) {
    currentPage.value = nextTotalPages;
  }
});

function goToPage(page: number): void {
  currentPage.value = Math.min(Math.max(page, 1), totalPages.value);
}

function isFavorite(row: BisEntry): boolean {
  return props.favoriteEntryKeys.has(getEntryKey(row));
}

function toggleFavorite(row: BisEntry): void {
  emit("toggle-favorite", row);
}

async function copyLink(url: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(url);
  } catch {
    // Keep this silent; clipboard API availability depends on browser/context.
  }
}
</script>

<template>
  <section class="panel table-wrap">
    <table>
      <thead>
        <tr>
          <th class="col-job">{{ t("table.job") }}</th>
          <th class="col-role">{{ t("table.role") }}</th>
          <th v-if="showCategoryColumn">{{ t("table.category") }}</th>
          <th>{{ infoHeaderLabel }}</th>
          <th class="col-notes">{{ t("table.notes") }}</th>
          <th class="col-damage" :aria-sort="sortAriaSort('damage')">
            <button
              class="sortable-header"
              type="button"
              @click="toggleSort('damage')"
              :aria-label="sortAriaLabel('damage', t('table.damage'))"
            >
              <span>{{ t("table.damage") }}</span>
              <span class="sort-indicator" aria-hidden="true">{{ sortIndicator('damage') }}</span>
            </button>
          </th>
          <th>{{ t("table.link") }}</th>
          <th>{{ t("table.source") }}</th>
          <th class="col-copy" aria-label="Actions"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in paginatedRows" :key="getEntryKey(row)">
          <td class="col-job"><strong :style="roleStyle(row.role)">{{ jobLabel(row.job) }}</strong></td>
          <td class="col-role" :style="roleStyle(row.role)">{{ roleLabel(row.role) }}</td>
          <td v-if="showCategoryColumn">{{ categoryLabel(row.category) }}</td>
          <td>{{ infoValue(row) }}</td>
          <td class="col-notes">
            <span
              class="notes-tooltip-anchor notes-main-tooltip"
              :class="{ 'has-tooltip': !!row.notesTooltip }"
              :data-tooltip="row.notesTooltip || ''"
              :tabindex="row.notesTooltip ? 0 : undefined"
            >
              {{ row.notes ?? "-" }}
            </span>
          </td>
          <td>
            <span class="damage-cell">
              <span>{{ row.damage?.value ?? "-" }}</span>
              <button
                v-if="damageType(row)"
                class="damage-kind-badge notes-tooltip-anchor has-tooltip"
                :class="damageType(row)"
                :data-tooltip="damageSubscriptTooltip(row)"
                type="button"
                :aria-label="damageSubscriptTooltip(row)"
              >
                {{ damageSubscriptLabel(row) }}
              </button>
            </span>
          </td>
          <td>
            <a :href="row.link.url" target="_blank" rel="noreferrer noopener">{{ row.link.name }}</a>
          </td>
          <td>
            <a :href="row.source.url" target="_blank" rel="noreferrer noopener">{{ row.source.name }}</a>
          </td>
          <td class="col-copy">
            <div class="row-actions">
              <button
                class="favorite-btn"
                :class="{ active: isFavorite(row) }"
                type="button"
                :title="isFavorite(row) ? 'Unfavorite' : 'Favorite'"
                :aria-label="isFavorite(row) ? 'Unfavorite' : 'Favorite'"
                @click="toggleFavorite(row)"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path
                    d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                    fill="currentColor"
                  />
                </svg>
              </button>
              <button
                class="copy-link-btn"
                type="button"
                :title="t('table.copyLink')"
                :aria-label="t('table.copyLink')"
                @click="copyLink(row.link.url)"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path
                    d="M9 9h10v11H9zM5 4h10v3h-2V6H7v7H6a1 1 0 0 0-1 1V4z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
          </td>
        </tr>
        <tr v-if="displayRows.length === 0">
          <td :colspan="emptyStateColspan">{{ t("table.noMatchingEntries") }}</td>
        </tr>
      </tbody>
    </table>
    <div v-if="totalRows > 0" class="pagination">
      <p class="pagination-summary">{{ t("table.pagination.showing", { from: pageFrom, to: pageTo, total: totalRows }) }}</p>
      <div class="pagination-controls">
        <button type="button" :disabled="currentPage === 1" :aria-label="t('table.pagination.firstAria')" @click="goToPage(1)">
          {{ t("table.pagination.first") }}
        </button>
        <button
          type="button"
          :disabled="currentPage === 1"
          :aria-label="t('table.pagination.prevAria')"
          @click="goToPage(currentPage - 1)"
        >
          {{ t("table.pagination.prev") }}
        </button>
        <span>{{ t("table.pagination.page", { current: currentPage, total: totalPages }) }}</span>
        <button
          type="button"
          :disabled="currentPage === totalPages"
          :aria-label="t('table.pagination.nextAria')"
          @click="goToPage(currentPage + 1)"
        >
          {{ t("table.pagination.next") }}
        </button>
        <button
          type="button"
          :disabled="currentPage === totalPages"
          :aria-label="t('table.pagination.lastAria')"
          @click="goToPage(totalPages)"
        >
          {{ t("table.pagination.last") }}
        </button>
      </div>
    </div>
  </section>
</template>
