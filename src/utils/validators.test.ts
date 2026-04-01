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
    updatedAt: "2026-03-29",
    damage: { value: "-", type: "none" },
    ...overrides
  };
}

function makeFile(entries: BisEntry[]): BisDataFile {
  return {
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
        damage: { value: "9999.9", type: "sim" }
      })
    ]);

    const result = validateBisData(input);
    expect(result.errors).toHaveLength(0);
    expect(result.data?.entries).toHaveLength(2);
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
        // invalid because Ultimate requires ultimate name
        link: { name: "XivGear", url: "https://xivgear.app" },
        source: { name: "The Balance", url: "https://www.thebalanceffxiv.com" },
        updatedAt: "2026-03-29"
      } as unknown as BisEntry
    ]);

    const result = validateBisData(input);
    expect(result.data?.entries).toHaveLength(1);
    expect(result.errors.some((message) => message.includes("Invalid entry at index 1"))).toBe(true);
  });

  it("rejects damage type none when value is not '-'", () => {
    const input = makeFile([
      makeEntry({
        damage: { value: "1234.5", type: "none" }
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

  it("returns error when entries is missing or not an array", () => {
    const result = validateBisData({
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
      { ...base, link: { ...base.link, url: "ftp://example.com" } },
      { ...base, source: { ...base.source, url: "mailto:test@example.com" } },
      { ...base, notes: 123 as unknown as string },
      { ...base, notesTooltip: 456 as unknown as string },
      { ...base, damage: { value: 1 as unknown as string, type: "sim" } },
      { ...base, damage: { value: "1234.5", type: "invalid" as unknown as "sim" } }
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

  it("keeps and sanitizes optional names arrays when valid", () => {
    const input = {
      ...makeFile([makeEntry()]),
      ultimateNames: ["Futures Rewritten", "The Omega Protocol"],
      criterionNames: ["Another Aloalo Island"],
      unrealNames: ["Containment Bay S1T7 (Unreal)"]
    };

    const result = validateBisData(input);
    expect(result.errors).toHaveLength(0);
    expect(result.data?.ultimateNames).toEqual(["Futures Rewritten", "The Omega Protocol"]);
    expect(result.data?.criterionNames).toEqual(["Another Aloalo Island"]);
    expect(result.data?.unrealNames).toEqual(["Containment Bay S1T7 (Unreal)"]);
  });

  it("reports invalid optional names arrays", () => {
    const input = {
      ...makeFile([makeEntry()]),
      ultimateNames: ["Valid", ""],
      criterionNames: "nope",
      unrealNames: ["", "Also invalid"]
    };

    const result = validateBisData(input);
    expect(result.errors).toContain("Invalid ultimateNames (expected array of non-empty strings).");
    expect(result.errors).toContain("Invalid criterionNames (expected array of non-empty strings).");
    expect(result.errors).toContain("Invalid unrealNames (expected array of non-empty strings).");
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

  it("rejects entries when declared names lists do not include referenced encounter values", () => {
    const input = {
      ...makeFile([
        makeEntry({
          category: "Ultimate",
          ultimate: "Futures Rewritten"
        }),
        makeEntry({
          category: "Criterion",
          criterionName: "Another Aloalo Island"
        }),
        makeEntry({
          category: "Unreal",
          unrealName: "Containment Bay S1T7 (Unreal)"
        })
      ]),
      ultimateNames: ["The Omega Protocol"],
      criterionNames: ["Another Mount Rokkon"],
      unrealNames: ["Some Other Unreal"]
    };

    const result = validateBisData(input);
    expect(result.data?.entries).toHaveLength(0);
    expect(result.errors.some((message) => message.includes('ultimate "Futures Rewritten" is not declared'))).toBe(true);
    expect(result.errors.some((message) => message.includes('criterion "Another Aloalo Island" is not declared'))).toBe(true);
    expect(result.errors.some((message) => message.includes('unreal "Containment Bay S1T7 (Unreal)" is not declared'))).toBe(
      true
    );
  });
});
