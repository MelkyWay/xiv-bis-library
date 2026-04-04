import { describe, expect, it } from "vitest";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, formatHeaderUpdatedDateByLocale, i18n } from "../i18n";

describe("i18n composition", () => {
  it("uses english as the default locale", () => {
    expect(i18n.global.locale.value).toBe(DEFAULT_LOCALE);
    expect(DEFAULT_LOCALE).toBe("en");
  });

  it("merges app and info message bundles for every locale", () => {
    for (const locale of SUPPORTED_LOCALES) {
      const localeMessages = i18n.global.getLocaleMessage(locale) as Record<string, unknown>;
      const app = localeMessages.app as Record<string, unknown>;
      const info = localeMessages.info as Record<string, unknown>;
      const footer = info.footer as Record<string, unknown>;
      const pages = info.pages as Record<string, unknown>;

      expect(app.title).toEqual(expect.any(String));
      expect(footer.home).toEqual(expect.any(String));
      expect(pages.about).toBeDefined();
    }
  });
});

describe("formatHeaderUpdatedDateByLocale", () => {
  it("formats locale-specific date patterns", () => {
    expect(formatHeaderUpdatedDateByLocale("2026-04-04", "fr")).toBe("04-04-2026");
    expect(formatHeaderUpdatedDateByLocale("2026-04-04", "de")).toBe("04.04.2026");
    expect(formatHeaderUpdatedDateByLocale("2026-04-04", "zh-CN")).toBe("2026-04-04");
    expect(formatHeaderUpdatedDateByLocale("2026-04-04", "zh-TW")).toBe("2026/04/04");
    expect(formatHeaderUpdatedDateByLocale("2026-04-04", "ko")).toBe("2026. 4. 4.");
  });

  it("leaves unsupported locales and invalid inputs unchanged", () => {
    expect(formatHeaderUpdatedDateByLocale("2026-04-04", "en")).toBe("2026-04-04");
    expect(formatHeaderUpdatedDateByLocale("not-a-date", "fr")).toBe("not-a-date");
  });
});
