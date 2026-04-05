<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { BisEntry, BisFiltersState, Category, Role } from "../types/bis";
import { getEntryKey } from "../utils/entryKey";
import { localizeJobName } from "../utils/jobLocalization";
import { roleColorTextStyle } from "../utils/roleColors";
import { localizeEncounterName } from "../utils/encounterLocalization";
const { t, locale } = useI18n();

const props = defineProps<{
  rows: BisEntry[];
  activeCategory: BisFiltersState["category"];
  activeEncounter: string;
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
const COPY_FEEDBACK_DURATION_MS = 1400;
const NOTE_SINGLE_LINE_TARGET_CHARS = 39;
const currentPage = ref(1);
const copiedEntryKey = ref<string | null>(null);
let copyFeedbackTimer: ReturnType<typeof setTimeout> | null = null;

const infoHeaderLabel = computed(() => {
  if (props.activeCategory === "Ultimate" || props.activeCategory === "Criterion" || props.activeCategory === "Unreal") {
    return t("table.encounter");
  }

  if (props.activeCategory === "Occult Crescent") {
    return t("table.patch");
  }

  if (
    props.activeCategory === "Savage" ||
    props.activeCategory === "Prog"
  ) {
    return t("table.tier");
  }

  return t("table.info");
});

const showCategoryColumn = computed(() => props.activeCategory === "All");
const showInfoColumn = computed(() => {
  if (props.activeCategory === "Ultimate" || props.activeCategory === "Criterion" || props.activeCategory === "Unreal") {
    return props.activeEncounter === "All";
  }
  return true;
});
const emptyStateColspan = computed(() => {
  const baseColumns = showCategoryColumn.value ? 7 : 6;
  return showInfoColumn.value ? baseColumns : baseColumns - 1;
});

function roleStyle(role: Role): Record<string, string> {
  return roleColorTextStyle(role);
}

function infoValue(row: BisEntry): string {
  if (row.content.kind === "encounter") {
    return row.content.value ? localizeEncounterName(row.content.value, String(locale.value), row.content.category) : "-";
  }
  return row.content.value;
}

function parseDamage(value: number | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  return Number.isFinite(value) ? value : null;
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
  return typeof row.damage?.value === "number" && Number.isFinite(row.damage.value);
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

function damageDisplayValue(row: BisEntry): string {
  if (!hasDamageValue(row)) {
    return "-";
  }
  return row.damage!.value!.toFixed(2);
}

function categoryLabel(category: Category): string {
  return t(`filters.categories.${category}`);
}

function jobLabel(job: string): string {
  return localizeJobName(job, String(locale.value));
}

function truncateAfterWord(text: string, maxLength: number): string {
  const normalized = text.trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  const candidate = normalized.slice(0, maxLength + 1);
  const lastWhitespace = candidate.search(/\s+[^\s]*$/);
  const endIndex = lastWhitespace === -1 ? maxLength : lastWhitespace;
  return `${normalized.slice(0, endIndex).trimEnd()}...`;
}

function noteText(row: BisEntry): string {
  return row.note?.text?.trim() ?? "";
}

function noteDetails(row: BisEntry): string {
  return row.note?.tooltip?.trim() ?? "";
}

function isNoteLikelyToWrap(note: string): boolean {
  return note.length > NOTE_SINGLE_LINE_TARGET_CHARS;
}

function isNoteTruncated(row: BisEntry): boolean {
  const text = noteText(row);
  return text.length > 0 && isNoteLikelyToWrap(text);
}

function notePreviewText(row: BisEntry): string {
  const text = noteText(row);
  if (!text) {
    return "-";
  }
  if (!isNoteLikelyToWrap(text)) {
    return text;
  }
  return truncateAfterWord(text, NOTE_SINGLE_LINE_TARGET_CHARS);
}

function hasNoteTooltip(row: BisEntry): boolean {
  return isNoteTruncated(row) || noteDetails(row).length > 0;
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

function isCopied(row: BisEntry): boolean {
  return copiedEntryKey.value === getEntryKey(row);
}

async function copyLink(row: BisEntry): Promise<void> {
  try {
    await navigator.clipboard.writeText(row.link.url);
    copiedEntryKey.value = getEntryKey(row);
    if (copyFeedbackTimer !== null) {
      clearTimeout(copyFeedbackTimer);
    }
    copyFeedbackTimer = setTimeout(() => {
      copiedEntryKey.value = null;
      copyFeedbackTimer = null;
    }, COPY_FEEDBACK_DURATION_MS);
  } catch {
    // Keep this silent; clipboard API availability depends on browser/context.
  }
}

onBeforeUnmount(() => {
  if (copyFeedbackTimer !== null) {
    clearTimeout(copyFeedbackTimer);
    copyFeedbackTimer = null;
  }
});
</script>

<template>
  <section class="panel table-wrap">
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th class="col-job">{{ t("table.job") }}</th>
            <th v-if="showCategoryColumn">{{ t("table.category") }}</th>
            <th v-if="showInfoColumn">{{ infoHeaderLabel }}</th>
            <th class="col-notes">Set/Link</th>
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
            <th>{{ t("table.source") }}</th>
            <th class="col-copy" :aria-label="t('table.actionsAria')"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in paginatedRows" :key="getEntryKey(row)">
            <td class="col-job"><strong :style="roleStyle(row.role)">{{ jobLabel(row.job) }}</strong></td>
            <td v-if="showCategoryColumn">{{ categoryLabel(row.content.category) }}</td>
            <td v-if="showInfoColumn">{{ infoValue(row) }}</td>
            <td class="col-notes">
              <span
                class="notes-tooltip-anchor notes-main-tooltip"
                :class="{ 'has-tooltip': hasNoteTooltip(row) }"
                :tabindex="hasNoteTooltip(row) ? 0 : undefined"
              >
                <a
                  v-if="notePreviewText(row) !== '-'"
                  class="note-link"
                  :href="row.link.url"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <span class="note-preview-text">{{ notePreviewText(row) }}</span>
                  <svg class="note-link-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path
                      d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3zm5 16v-7h2v9H3V3h9v2H5v14h14z"
                      fill="currentColor"
                    />
                  </svg>
                </a>
                <span v-else class="note-preview-text">-</span>
                <span v-if="hasNoteTooltip(row)" class="note-rich-tooltip" role="tooltip">
                  <strong class="note-rich-tooltip-title">{{ noteText(row) }}</strong>
                  <span v-if="noteDetails(row)" class="note-rich-tooltip-body">{{ noteDetails(row) }}</span>
                </span>
              </span>
            </td>
            <td>
              <span class="damage-cell">
                <span>{{ damageDisplayValue(row) }}</span>
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
              <a :href="row.source.url" target="_blank" rel="noreferrer noopener">{{ row.source.name }}</a>
            </td>
            <td class="col-copy">
              <div class="row-actions">
                <button
                  class="favorite-btn"
                  :class="{ active: isFavorite(row) }"
                  type="button"
                  :title="isFavorite(row) ? t('table.favoriteRemove') : t('table.favoriteAdd')"
                  :aria-label="isFavorite(row) ? t('table.favoriteRemove') : t('table.favoriteAdd')"
                  @click="toggleFavorite(row)"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path
                      d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
                <span class="copy-link-wrap">
                  <button
                    class="copy-link-btn"
                    :class="{ copied: isCopied(row) }"
                    type="button"
                    :title="isCopied(row) ? t('table.copyLinkSuccess') : t('table.copyLink')"
                    :aria-label="isCopied(row) ? t('table.copyLinkSuccess') : t('table.copyLink')"
                    @click="copyLink(row)"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path v-if="isCopied(row)" d="M9 16.2 5.5 12.7 4.1 14.1 9 19 20.3 7.7 18.9 6.3z" fill="currentColor" />
                      <path v-else d="M9 9h10v11H9zM5 4h10v3h-2V6H7v7H6a1 1 0 0 0-1 1V4z" fill="currentColor" />
                    </svg>
                  </button>
                  <span v-if="isCopied(row)" class="copy-feedback" role="status" aria-live="polite">{{ t("table.copyLinkSuccess") }}</span>
                </span>
              </div>
            </td>
          </tr>
          <tr v-if="displayRows.length === 0">
            <td :colspan="emptyStateColspan">{{ t("table.noMatchingEntries") }}</td>
          </tr>
        </tbody>
      </table>
    </div>
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


