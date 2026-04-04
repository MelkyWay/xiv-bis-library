import { describe, expect, it } from "vitest";
import {
  classifyDamageTypeFromHeader,
  extractDataUrlFromHtml,
  getOnlySetIndexFromUrl,
  guessDataUrlFromPage,
  normalizeImportConfig,
  normalizePageUrl,
  parseArgs,
  parseDamageNumber,
  shouldIncludeSetIndex
} from "../../scripts/tools/import-gearsets.mjs";

describe("import-gearsets helper functions", () => {
  it("parses cli arguments with flags and values", () => {
    const parsed = parseArgs(["--url", "https://xivgear.app", "--dry-run", "--job", "DRK"]);
    expect(parsed).toEqual({
      url: "https://xivgear.app",
      "dry-run": true,
      job: "DRK"
    });
  });

  it("normalizes hash-based xivgear urls", () => {
    const url = normalizePageUrl("https://xivgear.app/#/bis/drk/endwalker/anabaseios");
    expect(url).toBe("https://xivgear.app/?page=bis%7Cdrk%7Cendwalker%7Canabaseios");
  });

  it("extracts preferred data urls from preload links", () => {
    const html = `
      <head>
        <link rel="preload" href="https://cdn.example.com/asset.json" />
        <link rel="preload" href="https://staticbis.xivgear.app/drk/sample.json" />
      </head>
    `;
    expect(extractDataUrlFromHtml(html)).toBe("https://staticbis.xivgear.app/drk/sample.json");
  });

  it("guesses data urls from page query params", () => {
    expect(guessDataUrlFromPage("https://xivgear.app/?page=bis|drk|anabaseios|tank")).toBe(
      "https://staticbis.xivgear.app/drk/anabaseios/tank.json"
    );
    expect(guessDataUrlFromPage("https://xivgear.app/?page=sl|abc123")).toBe(
      "https://api.xivgear.app/shortlink/abc123"
    );
  });

  it("parses and applies set index filters", () => {
    expect(getOnlySetIndexFromUrl("https://xivgear.app/?page=bis|drk|x&onlySetIndex=3")).toBe(3);
    expect(getOnlySetIndexFromUrl("https://xivgear.app/?page=bis|drk|x&onlySetIndex=-1")).toBe(null);
    expect(shouldIncludeSetIndex(2, { includeSetIndexes: [1, 2], excludeSetIndexes: [0] })).toBe(true);
    expect(shouldIncludeSetIndex(0, { includeSetIndexes: [0], excludeSetIndexes: [0] })).toBe(false);
    expect(shouldIncludeSetIndex(3, {})).toBe(true);
  });

  it("normalizes damage parsing and classification", () => {
    expect(parseDamageNumber("12,345.67")).toBe(12345.67);
    expect(parseDamageNumber("-")).toBe(null);
    expect(classifyDamageTypeFromHeader("dmg/100p")).toBe("potency");
    expect(classifyDamageTypeFromHeader("Raid Sim DPS")).toBe("sim");
  });

  it("normalizes import config defaults and derives role", () => {
    const normalized = normalizeImportConfig(
      {
        url: "https://xivgear.app/?page=bis|drk|anabaseios&onlySetIndex=4",
        job: "drk",
        category: "Savage",
        tier: "7.4"
      },
      {}
    );

    expect(normalized.job).toBe("DRK");
    expect(normalized.role).toBe("Tank");
    expect(normalized.sourceName).toBe("XivGear");
    expect(normalized.includeSetIndexes).toEqual([4]);
    expect(normalized.replaceExisting).toBe(true);
    expect(normalized.importedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(normalized.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
