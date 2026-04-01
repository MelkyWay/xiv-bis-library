import { createI18n } from "vue-i18n";
import { CATEGORY_ORDER } from "../config/orders";
import type { Category } from "../types/bis";

function buildCategoryLabels(overrides: Partial<Record<Category, string>> = {}): Record<Category, string> {
  const defaults = Object.fromEntries(CATEGORY_ORDER.map((category) => [category, category])) as Record<Category, string>;
  return {
    ...defaults,
    ...overrides
  };
}

export function createTestI18n() {
  return createI18n({
    legacy: false,
    locale: "en",
    fallbackLocale: "en",
    missingWarn: false,
    fallbackWarn: false,
    messages: {
      en: {
        common: {
          all: "All",
          dark: "dark",
          light: "light",
          locale: "Language"
        },
        app: {
          title: "XIV BiS Library",
          subtitle: "Centralized links to community BiS sets by job, role, and content type.",
          lastUpdated: "Last updated: {date}",
          notAvailable: "-",
          loading: "Loading BiS data...",
          themeSwitch: "Switch to {theme} theme",
          validationWarnings: "Validation warnings"
        },
        filters: {
          job: "Job",
          category: "Category",
          role: "Role",
          search: "Search",
          searchPlaceholder: "Job, tier, source...",
          reset: "Reset filters",
          secondaryTypeUltimate: "Ultimate",
          secondaryTypeCriterion: "Criterion",
          secondaryTypeUnreal: "Unreal",
          secondaryAriaCurrent: "{type} filter, current value: {value}",
          secondaryAriaOptions: "{type} options",
          roles: {
            Tank: "Tank",
            Healer: "Healer",
            Melee: "Melee",
            "Physical Ranged": "Physical Ranged",
            "Magical Ranged": "Magical Ranged",
            Limited: "Limited"
          },
          roleGroups: {
            Tank: "Tanks",
            Healer: "Healers",
            Melee: "Melee",
            "Physical Ranged": "Physical Ranged",
            "Magical Ranged": "Magical Ranged",
            Limited: "Limited"
          },
          categories: buildCategoryLabels()
        },
        table: {
          job: "Job",
          role: "Role",
          category: "Category",
          info: "Info",
          encounter: "Encounter",
          tier: "Tier",
          notes: "Notes",
          damage: "Damage",
          link: "Link",
          source: "Source",
          copyLink: "Copy link",
          noMatchingEntries: "No matching entries.",
          sortLabel: "{label} sort ({current}). Activate for {next}.",
          sortCurrent: {
            none: "none",
            asc: "ascending",
            desc: "descending"
          },
          sortNext: {
            asc: "ascending",
            desc: "descending"
          },
          damageTypeSim: "Level 100 sim",
          damageTypePotency: "dmg/100 potency",
          pagination: {
            showing: "Showing {from}-{to} of {total}",
            page: "Page {current} / {total}",
            first: "First",
            prev: "Prev",
            next: "Next",
            last: "Last",
            firstAria: "First page",
            prevAria: "Previous page",
            nextAria: "Next page",
            lastAria: "Last page"
          }
        }
      }
    }
  });
}
