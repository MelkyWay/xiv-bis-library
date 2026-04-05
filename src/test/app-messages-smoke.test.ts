import { describe, expect, it } from "vitest";
import { CATEGORY_ORDER } from "../config/categories";
import { SUPPORTED_LOCALES } from "../i18n";
import { messages } from "../i18n/appMessages";

describe("app locale messages", () => {
  it("contains all supported locales", () => {
    for (const locale of SUPPORTED_LOCALES) {
      expect(messages[locale]).toBeDefined();
    }
  });

  it("exposes core UI sections for every locale", () => {
    for (const locale of SUPPORTED_LOCALES) {
      expect(messages[locale].app.title).toEqual(expect.any(String));
      expect(messages[locale].common.locale).toEqual(expect.any(String));
      expect(messages[locale].filters.search).toEqual(expect.any(String));
      expect(messages[locale].table.link).toEqual(expect.any(String));
    }
  });

  it("keeps filter category keys aligned with category config", () => {
    for (const locale of SUPPORTED_LOCALES) {
      for (const category of CATEGORY_ORDER) {
        expect(messages[locale].filters.categories[category]).toEqual(expect.any(String));
      }
    }
  });

  it("keeps contribution labels available in every supported locale", () => {
    for (const locale of SUPPORTED_LOCALES) {
      expect(messages[locale].app.contributeButton).toEqual(expect.any(String));
      expect(messages[locale].common.contribute).toEqual(expect.any(String));
    }
  });
});
