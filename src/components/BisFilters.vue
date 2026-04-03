<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { CATEGORY_OPTIONS } from "../config/orders";
import { ROLE_OPTIONS } from "../config/roles";
import type { BisFiltersState, Role } from "../types/bis";
import { localizeJobName } from "../utils/jobLocalization";
import { roleColorBorder, roleColorTextStyle } from "../utils/roleColors";
import { localizeEncounterName } from "../utils/ultimateLocalization";
const { t, locale } = useI18n();

const props = defineProps<{
  filters: BisFiltersState;
  groupedJobs: Array<{ role: Role; label: string; jobs: string[] }>;
  ultimates: string[];
  criterions: string[];
  unreals: string[];
  roleByJob: Record<string, Role>;
  favoritesOnly: boolean;
}>();

const emit = defineEmits<{
  (event: "update:filters", value: BisFiltersState): void;
  (event: "toggle:favorites-only"): void;
}>();

const roles: Array<"All" | Role> = ROLE_OPTIONS;

const categories = CATEGORY_OPTIONS;

function patch(next: Partial<BisFiltersState>): void {
  emit("update:filters", { ...props.filters, ...next });
}

function resetFilters(): void {
  emit("update:filters", {
    job: "All",
    category: "All",
    role: "All",
    ultimate: "All",
    criterion: "All",
    unreal: "All",
    query: ""
  });
}

function jobOptionStyle(job: string): Record<string, string> {
  return roleColorTextStyle(props.roleByJob[job]);
}

function borderColorForRole(role: Role | "All" | undefined): string {
  return roleColorBorder(role);
}

function withSelectedBorder(base: Record<string, string>, isSelected: boolean): Record<string, string> {
  if (!isSelected) {
    return base;
  }
  return {
    ...base,
    borderWidth: "2px"
  };
}

function roleOptionStyle(role: "All" | Role): Record<string, string> {
  return roleColorTextStyle(role);
}

function roleLabel(role: "All" | Role): string {
  if (role === "All") {
    return t("common.all");
  }
  return t(`filters.roles.${role}`);
}

function categoryLabel(category: (typeof CATEGORY_OPTIONS)[number]): string {
  if (category === "All") {
    return t("common.all");
  }
  return t(`filters.categories.${category}`);
}

function secondaryOptionLabel(value: string): string {
  if (props.filters.category === "Ultimate" || props.filters.category === "Criterion" || props.filters.category === "Unreal") {
    return localizeEncounterName(value, String(locale.value), props.filters.category);
  }
  return value;
}

function jobLabel(job: string): string {
  return localizeJobName(job, String(locale.value));
}


function groupLabelStyle(_role: Role): Record<string, string> {
  return { color: "var(--color-text)" };
}

function selectedJobStyle(): Record<string, string> {
  if (props.filters.job === "All") {
    return { color: "var(--color-text)", borderColor: "var(--color-input-border)" };
  }

  const role = props.roleByJob[props.filters.job];
  return withSelectedBorder({
    ...jobOptionStyle(props.filters.job),
    borderColor: borderColorForRole(role)
  }, true);
}

function selectedRoleStyle(): Record<string, string> {
  return withSelectedBorder({
    ...roleOptionStyle(props.filters.role),
    borderColor: borderColorForRole(props.filters.role)
  }, props.filters.role !== "All");
}

function selectedCategoryStyle(): Record<string, string> {
  return withSelectedBorder(
    {
      borderColor: "var(--color-selected-border)"
    },
    props.filters.category !== "All"
  );
}

function selectedSecondaryStyle(): Record<string, string> {
  return withSelectedBorder(
    {
      borderColor: "var(--color-selected-border)"
    },
    secondaryValue.value !== "All"
  );
}

const secondaryRoot = ref<HTMLElement | null>(null);
const secondaryTrigger = ref<HTMLElement | null>(null);
const secondaryMenu = ref<HTMLElement | null>(null);
const secondaryOpen = ref(false);
const secondaryMenuId = "secondary-filter-menu";
const jobRoot = ref<HTMLElement | null>(null);
const jobTrigger = ref<HTMLElement | null>(null);
const jobMenu = ref<HTMLElement | null>(null);
const jobOpen = ref(false);
const jobMenuId = "job-filter-menu";
const isSecondaryActive = computed(
  () => props.filters.category === "Ultimate" || props.filters.category === "Criterion" || props.filters.category === "Unreal"
);
const viewportWidth = ref(globalThis.window === undefined ? 1280 : globalThis.window.innerWidth);

const visibleGroupedJobs = computed(() => {
  if (props.filters.role === "All") {
    return props.groupedJobs;
  }

  const selected = props.groupedJobs.filter((group) => group.role === props.filters.role);
  const others = props.groupedJobs.filter((group) => group.role !== props.filters.role);
  return [...selected, ...others];
});

const secondaryOptions = computed(() => {
  if (props.filters.category === "Ultimate") return props.ultimates;
  if (props.filters.category === "Criterion") return props.criterions;
  if (props.filters.category === "Unreal") return props.unreals;
  return [];
});

const secondaryValue = computed(() => {
  if (props.filters.category === "Ultimate") return props.filters.ultimate;
  if (props.filters.category === "Criterion") return props.filters.criterion;
  if (props.filters.category === "Unreal") return props.filters.unreal;
  return "All";
});
const secondaryDisplayValue = computed(() => {
  if (secondaryValue.value === "All") {
    return t("common.all");
  }
  return secondaryOptionLabel(secondaryValue.value);
});
const jobDisplayValue = computed(() => {
  if (props.filters.job === "All") {
    return t("common.all");
  }
  return jobLabel(props.filters.job);
});

const secondaryTypeLabel = computed(() => {
  if (props.filters.category === "Criterion") return t("filters.secondaryTypeCriterion");
  if (props.filters.category === "Unreal") return t("filters.secondaryTypeUnreal");
  return t("filters.secondaryTypeUltimate");
});

function onSecondaryChange(value: string): void {
  if (props.filters.category === "Ultimate") {
    patch({ ultimate: value });
    return;
  }

  if (props.filters.category === "Criterion") {
    patch({ criterion: value });
    return;
  }

  if (props.filters.category === "Unreal") {
    patch({ unreal: value });
  }
}

function toggleSecondary(): void {
  if (!isSecondaryActive.value) {
    return;
  }
  secondaryOpen.value = !secondaryOpen.value;
  if (secondaryOpen.value) {
    void focusSecondarySelectedOption();
  }
}

function toggleJob(): void {
  jobOpen.value = !jobOpen.value;
  if (jobOpen.value) {
    void focusJobSelectedOption();
  }
}

async function chooseJob(job: string): Promise<void> {
  patch({ job });
  jobOpen.value = false;
  await nextTick();
  jobTrigger.value?.focus();
}

async function chooseSecondary(value: string): Promise<void> {
  onSecondaryChange(value);
  secondaryOpen.value = false;
  await nextTick();
  secondaryTrigger.value?.focus();
}

function optionIndexByChecked(options: HTMLButtonElement[]): number {
  const checkedIndex = options.findIndex((option) => option.getAttribute("aria-checked") === "true");
  return checkedIndex >= 0 ? checkedIndex : 0;
}

function focusOption(options: HTMLButtonElement[], index: number): void {
  if (options.length === 0) {
    return;
  }
  const nextIndex = Math.max(0, Math.min(index, options.length - 1));
  options[nextIndex].focus();
}

function moveMenuFocus(event: KeyboardEvent, options: HTMLButtonElement[]): boolean {
  if (options.length === 0) {
    return false;
  }
  const activeIndex = options.findIndex((option) => option === document.activeElement);
  const selectedIndex = optionIndexByChecked(options);
  const currentIndex = activeIndex >= 0 ? activeIndex : selectedIndex;

  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      focusOption(options, currentIndex + 1);
      return true;
    case "ArrowUp":
      event.preventDefault();
      focusOption(options, currentIndex - 1);
      return true;
    case "Home":
      event.preventDefault();
      focusOption(options, 0);
      return true;
    case "End":
      event.preventDefault();
      focusOption(options, options.length - 1);
      return true;
    default:
      return false;
  }
}

function openJobFromKeyboard(event: KeyboardEvent): void {
  if (event.key !== "Enter" && event.key !== " " && event.key !== "ArrowDown") {
    return;
  }
  event.preventDefault();
  if (!jobOpen.value) {
    jobOpen.value = true;
  }
  void focusJobSelectedOption();
}

function openSecondaryFromKeyboard(event: KeyboardEvent): void {
  if (event.key !== "Enter" && event.key !== " " && event.key !== "ArrowDown") {
    return;
  }
  if (!isSecondaryActive.value) {
    return;
  }
  event.preventDefault();
  if (!secondaryOpen.value) {
    secondaryOpen.value = true;
  }
  void focusSecondarySelectedOption();
}

async function focusJobSelectedOption(): Promise<void> {
  await nextTick();
  const options = Array.from(jobMenu.value?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]') ?? []);
  focusOption(options, optionIndexByChecked(options));
}

async function focusSecondarySelectedOption(): Promise<void> {
  await nextTick();
  const options = Array.from(secondaryMenu.value?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]') ?? []);
  focusOption(options, optionIndexByChecked(options));
}

function onJobMenuKeydown(event: KeyboardEvent): void {
  const options = Array.from(jobMenu.value?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]') ?? []);
  if (moveMenuFocus(event, options)) {
    return;
  }
  if (event.key === "Escape") {
    event.preventDefault();
    jobOpen.value = false;
    jobTrigger.value?.focus();
  }
}

function onSecondaryMenuKeydown(event: KeyboardEvent): void {
  const options = Array.from(secondaryMenu.value?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]') ?? []);
  if (moveMenuFocus(event, options)) {
    return;
  }
  if (event.key === "Escape") {
    event.preventDefault();
    secondaryOpen.value = false;
    secondaryTrigger.value?.focus();
  }
}

function measureLabelWidth(text: string): number {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const triggerStyle = secondaryTrigger.value ? globalThis.window.getComputedStyle(secondaryTrigger.value) : null;
  const font = triggerStyle ? `${triggerStyle.fontWeight} ${triggerStyle.fontSize} ${triggerStyle.fontFamily}` : "400 16px Segoe UI";

  if (!context) {
    return text.length * 9;
  }

  context.font = font;
  return context.measureText(text).width;
}

const secondaryMenuStyle = computed<Record<string, string>>(() => {
  const labels = [t("common.all"), ...secondaryOptions.value.map((option) => secondaryOptionLabel(option))];
  const longestLabel = labels.reduce((longest, current) => (current.length > longest.length ? current : longest), "All");

  const triggerWidth = secondaryTrigger.value?.offsetWidth ?? 0;
  // Add extra space for menu padding + a small right breathing margin.
  const contentWidth = Math.ceil(measureLabelWidth(longestLabel) + 52);
  const desiredWidth = Math.max(triggerWidth, contentWidth);
  const clampedWidth = Math.min(desiredWidth, Math.floor(viewportWidth.value * 0.9));

  return { width: `${clampedWidth}px` };
});

function handleDocumentClick(event: MouseEvent): void {
  const target = event.target as Node | null;
  if (!target) {
    return;
  }

  if (jobRoot.value && !jobRoot.value.contains(target)) {
    jobOpen.value = false;
  }

  if (secondaryRoot.value && !secondaryRoot.value.contains(target)) {
    secondaryOpen.value = false;
  }
}

function handleWindowResize(): void {
  viewportWidth.value = globalThis.window.innerWidth;
}

watch(
  () => props.filters.category,
  () => {
    secondaryOpen.value = false;
  }
);

watch(
  () => props.filters.job,
  () => {
    jobOpen.value = false;
  }
);

onMounted(() => {
  document.addEventListener("click", handleDocumentClick);
  globalThis.window.addEventListener("resize", handleWindowResize);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleDocumentClick);
  globalThis.window.removeEventListener("resize", handleWindowResize);
});
</script>

<template>
  <section class="panel filters">
    <label>
      {{ t("filters.role") }}
      <select
        :value="filters.role"
        :style="selectedRoleStyle()"
        @change="patch({ role: ($event.target as HTMLSelectElement).value as BisFiltersState['role'] })"
      >
        <option v-for="role in roles" :key="role" :value="role" :style="roleOptionStyle(role)">{{ roleLabel(role) }}</option>
      </select>
    </label>

    <div class="filter-field">
      <span class="field-label">{{ t("filters.job") }}</span>
      <div ref="jobRoot" class="job-select">
        <button
          ref="jobTrigger"
          type="button"
          class="job-select-trigger"
          :style="selectedJobStyle()"
          :aria-label="t('filters.secondaryAriaCurrent', { type: t('filters.job'), value: jobDisplayValue })"
          :aria-expanded="jobOpen"
          aria-haspopup="menu"
          :aria-controls="jobMenuId"
          @click.stop="toggleJob"
          @keydown="openJobFromKeyboard"
        >
          <span>{{ jobDisplayValue }}</span>
        </button>
        <div
          ref="jobMenu"
          v-if="jobOpen"
          :id="jobMenuId"
          class="job-select-menu"
          role="menu"
          :aria-label="t('filters.secondaryAriaOptions', { type: t('filters.job') })"
          @keydown="onJobMenuKeydown"
        >
          <button
            type="button"
            class="job-select-option"
            role="menuitemradio"
            :aria-checked="filters.job === 'All'"
            :style="{ color: 'var(--color-text)' }"
            @click="chooseJob('All')"
          >
            {{ t("common.all") }}
          </button>
          <div v-for="group in visibleGroupedJobs" :key="group.role" class="job-select-group">
            <div class="job-select-group-label" :style="groupLabelStyle(group.role)">{{ group.label }}</div>
            <button
              v-for="job in group.jobs"
              :key="job"
              type="button"
              class="job-select-option"
              role="menuitemradio"
              :aria-checked="filters.job === job"
              :style="jobOptionStyle(job)"
              @click="chooseJob(job)"
            >
              {{ jobLabel(job) }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="stack">
      <label>
        {{ t("filters.category") }}
        <select
          :value="filters.category"
          :style="selectedCategoryStyle()"
          @change="patch({ category: ($event.target as HTMLSelectElement).value as BisFiltersState['category'] })"
        >
          <option v-for="category in categories" :key="category" :value="category">{{ categoryLabel(category) }}</option>
        </select>
      </label>

      <div class="ultimate-select-wrap" :class="{ 'is-hidden': !isSecondaryActive }">
        <div class="dotted-separator" aria-hidden="true"></div>
        <div ref="secondaryRoot" class="secondary-select" :class="{ disabled: !isSecondaryActive }">
          <button
            ref="secondaryTrigger"
            type="button"
            class="secondary-select-trigger"
            :disabled="!isSecondaryActive"
            :aria-label="t('filters.secondaryAriaCurrent', { type: secondaryTypeLabel, value: secondaryDisplayValue })"
            :aria-expanded="secondaryOpen"
            aria-haspopup="menu"
            :aria-controls="secondaryMenuId"
            :style="selectedSecondaryStyle()"
            @click.stop="toggleSecondary"
            @keydown="openSecondaryFromKeyboard"
          >
            <span>{{ secondaryDisplayValue }}</span>
          </button>
          <div
            ref="secondaryMenu"
            v-if="secondaryOpen && isSecondaryActive"
            :id="secondaryMenuId"
            class="secondary-select-menu"
            role="menu"
            :aria-label="t('filters.secondaryAriaOptions', { type: secondaryTypeLabel })"
            :style="secondaryMenuStyle"
            @keydown="onSecondaryMenuKeydown"
          >
            <button
              type="button"
              class="secondary-select-option"
              role="menuitemradio"
              :aria-checked="secondaryValue === 'All'"
              @click="chooseSecondary('All')"
            >
              {{ t("common.all") }}
            </button>
            <button
              v-for="option in secondaryOptions"
              :key="option"
              type="button"
              class="secondary-select-option"
              role="menuitemradio"
              :aria-checked="secondaryValue === option"
              @click="chooseSecondary(option)"
            >
              {{ secondaryOptionLabel(option) }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <label class="search">
      {{ t("filters.search") }}
      <input
        :value="filters.query"
        type="search"
        :placeholder="t('filters.searchPlaceholder')"
        @input="patch({ query: ($event.target as HTMLInputElement).value })"
      />
    </label>

    <div class="actions">
      <button
        class="favorites-toggle"
        :class="{ active: favoritesOnly }"
        type="button"
        @click="emit('toggle:favorites-only')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
            fill="currentColor"
          />
        </svg>
        {{ t("filters.favorites") }}
      </button>
      <button class="reset-filters" type="button" @click="resetFilters">{{ t("filters.reset") }}</button>
    </div>
  </section>
</template>


