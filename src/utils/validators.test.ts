import { describe, expect, it } from "vitest";
import type { BisDataFile, BisEntry } from "../types/bis";
import { validateBisData } from "./validators";

function makeEntry(overrides: Partial<BisEntry> = {}): BisEntry {
  return {
    job: "DRK",
    role: "Tank",
    category: "Savage",
    tier: "7.4",
    link: { name: "XivGear", url: "https://xivgear.app" },
    source: { name: "The Balance", url: "https://www.thebalanceffxiv.com" },
    importedAt: "2026-03-29",
    updatedAt: "2026-03-29",
    damage: { value: null, type: "none" },
    ...overrides
  };
}

function makeFile(entries: BisEntry[]): BisDataFile {
  return {
    schemaVersion: 1,
    lastUpdated: "2026-03-29",
    entries
  };
}

describe("validateBisData", () => {
  it("accepts a valid data file", () => {
    const input = makeFile([
      makeEntry(),
      makeEntry({
        category: "Ultimate",
        ultimate: "Futures Rewritten",
        damage: { value: 9999.9, type: "sim" }
      })
    ]);

    const result = validateBisData(input);
    expect(result.errors).toHaveLength(0);
    expect(result.data?.entries).toHaveLength(2);
  });

  it("accepts note tooltip set to null", () => {
    const input = makeFile([
      makeEntry({
        note: {
          text: "valid note",
          tooltip: null
        }
      })
    ]);

    const result = validateBisData(input);
    expect(result.errors).toHaveLength(0);
    expect(result.data?.entries).toHaveLength(1);
  });

  it("rejects a non-object root", () => {
    const result = validateBisData([]);
    expect(result.data).toBeUndefined();
    expect(result.errors).toContain("Data file is not an object.");
  });

  it("ignores invalid entries while keeping valid ones", () => {
    const input = makeFile([
      makeEntry(),
      {
        job: "DRK",
        role: "Tank",
        category: "Ultimate",
        tier: "7.4",
        link: { name: "XivGear", url: "https://xivgear.app" },
        source: { name: "The Balance", url: "https://www.thebalanceffxiv.com" },
        importedAt: "2026-03-29",
        updatedAt: "2026-03-29"
      } as unknown as BisEntry
    ]);

    const result = validateBisData(input);
    expect(result.data?.entries).toHaveLength(1);
    expect(result.errors.some((message) => message.includes("Invalid entry at index 1"))).toBe(true);
  });

  it("rejects damage type none when value is not null", () => {
    const input = makeFile([
      makeEntry({
        damage: { value: 1234.5, type: "none" }
      })
    ]);

    const result = validateBisData(input);
    expect(result.data?.entries).toHaveLength(0);
    expect(result.errors.some((message) => message.includes("Invalid entry at index 0"))).toBe(true);
  });

  it("returns warnings for malformed lastUpdated but still returns data when it is a string", () => {
    const input = {
      ...makeFile([makeEntry()]),
      lastUpdated: "2026-3-9"
    };

    const result = validateBisData(input);
    expect(result.data).toBeDefined();
    expect(result.errors).toContain("Invalid or missing lastUpdated (expected YYYY-MM-DD).");
  });

  it("returns no data when lastUpdated is not a string", () => {
    const input = {
      ...makeFile([makeEntry()]),
      lastUpdated: 20260329
    };

    const result = validateBisData(input);
    expect(result.data).toBeUndefined();
    expect(result.errors).toContain("Invalid or missing lastUpdated (expected YYYY-MM-DD).");
  });

  it("returns error for missing schemaVersion", () => {
    const input = {
      lastUpdated: "2026-03-29",
      entries: [makeEntry()]
    };

    const result = validateBisData(input);
    expect(result.errors).toContain("Invalid or missing schemaVersion (expected 1).");
  });

  it("returns error when entries is missing or not an array", () => {
    const result = validateBisData({
      schemaVersion: 1,
      lastUpdated: "2026-03-29",
      entries: "not-an-array"
    });

    expect(result.data).toBeUndefined();
    expect(result.errors).toContain("Invalid or missing entries array.");
  });

  it("rejects invalid role/category/tier/date/url and optional field types", () => {
    const base = makeEntry();
    const variants: BisEntry[] = [
      { ...base, role: "NotARole" as BisEntry["role"] },
      { ...base, category: "NotACategory" as BisEntry["category"] },
      { ...base, tier: "x.y" },
      { ...base, updatedAt: "03-29-2026" },
      { ...base, importedAt: "03-29-2026" },
      { ...base, link: { ...base.link, url: "ftp://example.com" } },
      { ...base, source: { ...base.source, url: "mailto:test@example.com" } },
      { ...base, note: 123 as unknown as BisEntry["note"] },
      { ...base, note: { text: "ok", tooltip: 456 as unknown as string } },
      { ...base, damage: { value: "1234.5" as unknown as number, type: "sim" } },
      { ...base, damage: { value: 1234.5, type: "invalid" as unknown as "sim" } }
    ];

    const result = validateBisData(makeFile(variants));
    expect(result.data?.entries).toHaveLength(0);
    expect(result.errors.filter((message) => message.includes("Invalid entry at index")).length).toBe(variants.length);
  });

  it("rejects missing required category-specific fields", () => {
    const entries: BisEntry[] = [
      makeEntry({ category: "Ultimate", ultimate: undefined }),
      makeEntry({ category: "Criterion", criterionName: undefined }),
      makeEntry({ category: "Unreal", unrealName: undefined }),
      makeEntry({ category: "Other", otherName: undefined })
    ];

    const result = validateBisData(makeFile(entries));
    expect(result.data?.entries).toHaveLength(0);
    expect(result.errors.filter((message) => message.includes("Invalid entry at index")).length).toBe(4);
  });

  it("rejects ultimate entries with encounter names not in configured ultimate order", () => {
    const input = makeFile([
      makeEntry({
        category: "Ultimate",
        ultimate: "Unknown Ultimate"
      })
    ]);

    const result = validateBisData(input);
    expect(result.data?.entries).toHaveLength(0);
    expect(result.errors.some((message) => message.includes('unknown ultimate "Unknown Ultimate"'))).toBe(true);
  });

  it("rejects entries with unknown jobs", () => {
    const input = makeFile([
      makeEntry({
        job: "XYZ"
      })
    ]);

    const result = validateBisData(input);
    expect(result.data?.entries).toHaveLength(0);
    expect(result.errors.some((message) => message.includes('unknown job "XYZ"'))).toBe(true);
  });

  it("rejects entries when role does not match configured role for job", () => {
    const input = makeFile([
      makeEntry({
        job: "DRK",
        role: "Healer"
      })
    ]);

    const result = validateBisData(input);
    expect(result.data?.entries).toHaveLength(0);
    expect(result.errors.some((message) => message.includes('does not match configured role for job "DRK"'))).toBe(true);
  });
});
