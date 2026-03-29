import { describe, expect, it } from "vitest";
import type { BisEntry, BisFiltersState, Category } from "../types/bis";
import { filterEntries } from "./filters";

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

function makeFilters(overrides: Partial<BisFiltersState> = {}): BisFiltersState {
  return {
    role: "All",
    category: "All",
    job: "All",
    ultimate: "All",
    criterion: "All",
    unreal: "All",
    query: "",
    ...overrides
  };
}

describe("filterEntries", () => {
  it("filters by role, category, and query", () => {
    const entries: BisEntry[] = [
      makeEntry({ job: "DRK", role: "Tank", category: "Savage", notes: "Main tank set" }),
      makeEntry({ job: "GNB", role: "Tank", category: "Ultimate", ultimate: "Futures Rewritten", notes: "FRU set" }),
      makeEntry({ job: "SCH", role: "Healer", category: "Savage", notes: "Healer setup" })
    ];

    const out = filterEntries(
      entries,
      makeFilters({
        role: "Tank",
        category: "Ultimate",
        query: "fru"
      })
    );

    expect(out).toHaveLength(1);
    expect(out[0].job).toBe("GNB");
  });

  it("orders Ultimate by job picker order, then encounter order, then damage descending", () => {
    const entries: BisEntry[] = [
      makeEntry({
        job: "DRK",
        role: "Tank",
        category: "Ultimate",
        ultimate: "Futures Rewritten",
        damage: { value: "9000.0", type: "sim" }
      }),
      makeEntry({
        job: "DRK",
        role: "Tank",
        category: "Ultimate",
        ultimate: "The Omega Protocol",
        damage: { value: "9800.0", type: "sim" }
      }),
      makeEntry({
        job: "GNB",
        role: "Tank",
        category: "Ultimate",
        ultimate: "Futures Rewritten",
        damage: { value: "8700.0", type: "sim" }
      }),
      makeEntry({
        job: "GNB",
        role: "Tank",
        category: "Ultimate",
        ultimate: "The Omega Protocol",
        damage: { value: "9900.0", type: "sim" }
      })
    ];

    const out = filterEntries(entries, makeFilters({ category: "Ultimate" }), {
      jobOrder: ["GNB", "DRK"],
      ultimateOrder: ["Futures Rewritten", "The Omega Protocol"]
    });

    expect(out.map((entry) => `${entry.job}|${entry.ultimate}`)).toEqual([
      "GNB|Futures Rewritten",
      "GNB|The Omega Protocol",
      "DRK|Futures Rewritten",
      "DRK|The Omega Protocol"
    ]);
  });

  it("when job is selected, orders by category then encounter order then damage", () => {
    const entries: BisEntry[] = [
      makeEntry({
        job: "DRK",
        role: "Tank",
        category: "Ultimate",
        ultimate: "The Omega Protocol",
        damage: { value: "8200.0", type: "sim" }
      }),
      makeEntry({
        job: "DRK",
        role: "Tank",
        category: "Ultimate",
        ultimate: "Futures Rewritten",
        damage: { value: "8100.0", type: "sim" }
      }),
      makeEntry({
        job: "DRK",
        role: "Tank",
        category: "Savage",
        damage: { value: "10100.0", type: "sim" }
      }),
      makeEntry({
        job: "DRK",
        role: "Tank",
        category: "Criterion",
        criterionName: "Another Aloalo Island",
        damage: { value: "7000.0", type: "sim" }
      }),
      makeEntry({
        job: "DRK",
        role: "Tank",
        category: "Criterion",
        criterionName: "Another Mount Rokkon",
        damage: { value: "7100.0", type: "sim" }
      })
    ];

    const out = filterEntries(entries, makeFilters({ job: "DRK" }), {
      categoryOrder: ["Savage", "Ultimate", "Criterion"] as Category[],
      ultimateOrder: ["Futures Rewritten", "The Omega Protocol"],
      criterionOrder: ["Another Aloalo Island", "Another Mount Rokkon"]
    });

    expect(out.map((entry) => `${entry.category}|${entry.ultimate ?? entry.criterionName ?? "-"}`)).toEqual([
      "Savage|-",
      "Ultimate|Futures Rewritten",
      "Ultimate|The Omega Protocol",
      "Criterion|Another Aloalo Island",
      "Criterion|Another Mount Rokkon"
    ]);
  });

  it("puts missing damage values last when all sort keys tie", () => {
    const entries: BisEntry[] = [
      makeEntry({
        job: "DRK",
        role: "Tank",
        category: "Ultimate",
        ultimate: "Futures Rewritten",
        notes: "with damage",
        damage: { value: "9000.0", type: "sim" }
      }),
      makeEntry({
        job: "DRK",
        role: "Tank",
        category: "Ultimate",
        ultimate: "Futures Rewritten",
        notes: "without damage",
        damage: { value: "-", type: "none" }
      })
    ];

    const out = filterEntries(entries, makeFilters({ category: "Ultimate" }), {
      jobOrder: ["DRK"],
      ultimateOrder: ["Futures Rewritten"]
    });

    expect(out[0].notes).toBe("with damage");
    expect(out[1].notes).toBe("without damage");
  });

  it("filters by criterion and unreal selectors", () => {
    const entries: BisEntry[] = [
      makeEntry({
        job: "DRK",
        role: "Tank",
        category: "Criterion",
        criterionName: "Another Mount Rokkon"
      }),
      makeEntry({
        job: "DRK",
        role: "Tank",
        category: "Criterion",
        criterionName: "Another Aloalo Island"
      }),
      makeEntry({
        job: "DRK",
        role: "Tank",
        category: "Unreal",
        unrealName: "Containment Bay S1T7 (Unreal)"
      })
    ];

    const criterionOut = filterEntries(
      entries,
      makeFilters({
        category: "Criterion",
        criterion: "Another Mount Rokkon"
      })
    );
    expect(criterionOut).toHaveLength(1);
    expect(criterionOut[0].criterionName).toBe("Another Mount Rokkon");

    const unrealOut = filterEntries(
      entries,
      makeFilters({
        category: "Unreal",
        unreal: "Containment Bay S1T7 (Unreal)"
      })
    );
    expect(unrealOut).toHaveLength(1);
    expect(unrealOut[0].unrealName).toBe("Containment Bay S1T7 (Unreal)");
  });

  it("for all filters=All, applies category ordering and category-specific encounter ordering", () => {
    const entries: BisEntry[] = [
      makeEntry({
        job: "DRK",
        role: "Tank",
        category: "Criterion",
        criterionName: "Another Mount Rokkon",
        damage: { value: "7000.0", type: "sim" }
      }),
      makeEntry({
        job: "DRK",
        role: "Tank",
        category: "Ultimate",
        ultimate: "The Omega Protocol",
        damage: { value: "8000.0", type: "sim" }
      }),
      makeEntry({
        job: "DRK",
        role: "Tank",
        category: "Ultimate",
        ultimate: "Futures Rewritten",
        damage: { value: "7900.0", type: "sim" }
      }),
      makeEntry({
        job: "DRK",
        role: "Tank",
        category: "Criterion",
        criterionName: "Another Aloalo Island",
        damage: { value: "7100.0", type: "sim" }
      }),
      makeEntry({
        job: "DRK",
        role: "Tank",
        category: "Savage",
        damage: { value: "9000.0", type: "sim" }
      })
    ];

    const out = filterEntries(entries, makeFilters(), {
      jobOrder: ["DRK"],
      categoryOrder: ["Savage", "Ultimate", "Criterion"] as Category[],
      ultimateOrder: ["Futures Rewritten", "The Omega Protocol"],
      criterionOrder: ["Another Aloalo Island", "Another Mount Rokkon"]
    });

    expect(out.map((entry) => `${entry.category}|${entry.ultimate ?? entry.criterionName ?? "-"}`)).toEqual([
      "Savage|-",
      "Ultimate|Futures Rewritten",
      "Ultimate|The Omega Protocol",
      "Criterion|Another Aloalo Island",
      "Criterion|Another Mount Rokkon"
    ]);
  });

  it("falls back to role order when job order does not differentiate", () => {
    const entries: BisEntry[] = [
      makeEntry({
        job: "AAA",
        role: "Tank",
        category: "Savage",
        damage: { value: "-", type: "none" }
      }),
      makeEntry({
        job: "AAA",
        role: "Healer",
        category: "Savage",
        damage: { value: "-", type: "none" }
      })
    ];

    const out = filterEntries(entries, makeFilters(), {
      // Empty order intentionally forces fallback paths.
      jobOrder: [],
      categoryOrder: []
    });

    expect(out[0].role).toBe("Tank");
    expect(out[1].role).toBe("Healer");
  });

  it("applies final localeCompare tie-break path for fully tied entries", () => {
    const entries: BisEntry[] = [
      makeEntry({
        job: "AAA",
        role: "Tank",
        category: "Savage",
        notes: "first",
        damage: { value: "-", type: "none" }
      }),
      makeEntry({
        job: "AAA",
        role: "Tank",
        category: "Savage",
        notes: "second",
        damage: { value: "-", type: "none" }
      })
    ];

    const out = filterEntries(entries, makeFilters(), {
      jobOrder: [],
      categoryOrder: []
    });

    expect(out).toHaveLength(2);
    expect(out.map((entry) => entry.notes)).toEqual(["first", "second"]);
  });

  it("rejects entries on job, ultimate, and unreal mismatch branches", () => {
    const jobMismatch = filterEntries(
      [makeEntry({ job: "DRK", category: "Savage" })],
      makeFilters({ job: "GNB" })
    );
    expect(jobMismatch).toHaveLength(0);

    const ultimateMismatch = filterEntries(
      [makeEntry({ category: "Ultimate", ultimate: "Futures Rewritten" })],
      makeFilters({ category: "Ultimate", ultimate: "The Omega Protocol" })
    );
    expect(ultimateMismatch).toHaveLength(0);

    const unrealMismatch = filterEntries(
      [makeEntry({ category: "Unreal", unrealName: "Containment Bay S1T7 (Unreal)" })],
      makeFilters({ category: "Unreal", unreal: "Another Unreal" })
    );
    expect(unrealMismatch).toHaveLength(0);
  });
});
