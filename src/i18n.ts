import { createI18n } from "vue-i18n";
import { CATEGORY_ORDER } from "./config/orders";
import { infoMessages } from "./locales/infoMessages";
import { messages } from "./locales/appMessages";
import type { Category } from "./types/bis";

export const SUPPORTED_LOCALES = ["en", "fr", "de", "ja", "ko", "zh-CN", "zh-TW"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: SupportedLocale = "en";
export const LOCALE_STORAGE_KEY = "locale";

type DateParts = {
  year: string;
  month: string;
  day: string;
};

type HeaderDateFormatRule = {
  matches: RegExp;
  format: (parts: DateParts) => string;
};

const HEADER_UPDATED_DATE_FORMAT_RULES: readonly HeaderDateFormatRule[] = [
  {
    matches: /^fr(?:-|$)/,
    format: ({ day, month, year }) => `${day}-${month}-${year}`
  },
  {
    matches: /^de(?:-|$)/,
    format: ({ day, month, year }) => `${day}.${month}.${year}`
  },
  {
    matches: /^zh-cn(?:-|$)/,
    format: ({ year, month, day }) => `${year}-${month}-${day}`
  },
  {
    matches: /^zh-tw(?:-|$)/,
    format: ({ year, month, day }) => `${year}/${month}/${day}`
  },
  {
    matches: /^ko(?:-|$)/,
    format: ({ year, month, day }) => `${year}. ${Number(month)}. ${Number(day)}.`
  }
];

export function formatHeaderUpdatedDateByLocale(rawValue: string, localeCode: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:[T ].*)?$/.exec(rawValue);
  if (!match) {
    return rawValue;
  }

  const [, year, month, day] = match;
  const normalizedLocale = localeCode.toLowerCase();
  const matchedRule = HEADER_UPDATED_DATE_FORMAT_RULES.find((rule) => rule.matches.test(normalizedLocale));

  if (!matchedRule) {
    return rawValue;
  }

  return matchedRule.format({ year, month, day });
}

function buildCategoryLabels(
  overrides: Partial<Record<Category, string>> = {}
): Record<Category, string> {
  const defaults = Object.fromEntries(
    CATEGORY_ORDER.map((category) => [category, category])
  ) as Record<Category, string>;
  return {
    ...defaults,
    ...overrides
  };
}

const mergedMessages = Object.fromEntries(
  SUPPORTED_LOCALES.map((locale) => [
    locale,
    {
      ...messages[locale],
      ...infoMessages[locale]
    }
  ])
);

const dateTimeFormats = {
  en: {
    headerUpdated: {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "UTC"
    }
  },
  fr: {
    headerUpdated: {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "UTC"
    }
  },
  de: {
    headerUpdated: {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "UTC"
    }
  },
  ja: {
    headerUpdated: {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "UTC"
    }
  },
  ko: {
    headerUpdated: {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "UTC"
    }
  },
  "zh-CN": {
    headerUpdated: {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "UTC"
    }
  },
  "zh-TW": {
    headerUpdated: {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "UTC"
    }
  }
} as const;

export const i18n = createI18n({
  legacy: false,
  locale: DEFAULT_LOCALE,
  fallbackLocale: DEFAULT_LOCALE,
  messages: mergedMessages,
  datetimeFormats: dateTimeFormats
});
