import { describe, expect, it } from "vitest";
import type { BisEntry, BisFiltersState, Category } from "../../types/bis";
import { filterEntries } from "../../utils/filters";

function makeEntry(overrides: Partial<BisEntry> = {}): BisEntry {
  return {
    job: "DRK",
    role: "Tank",
    content: {
      category: "Savage",
      kind: "tier",
      value: "7.4"
    },
    link: { name: "XivGear", url: "https://xivgear.app" },
    source: { name: "The Balance", url: "https://www.thebalanceffxiv.com" },
    importedAt: "2026-03-29",
    updatedAt: "2026-03-29",
    damage: { value: null, type: "none" },
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
      makeEntry({ job: "DRK", role: "Tank", content: { category: "Savage", kind: "tier", value: "7.4" }, note: { text: "Main tank set" } }),
      makeEntry({
        job: "GNB",
        role: "Tank",
        content: { category: "Ultimate", kind: "encounter", value: "Futures Rewritten" },
        note: { text: "FRU set" }
      }),
      makeEntry({ job: "SCH", role: "Healer", content: { category: "Savage", kind: "tier", value: "7.4" }, note: { text: "Healer setup" } })
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
        content: { category: "Ultimate", kind: "encounter", value: "Futures Rewritten" },
        damage: { value: 9000.0, type: "sim" }
      }),
      makeEntry({
        job: "DRK",
        role: "Tank",
        content: { category: "Ultimate", kind: "encounter", value: "The Omega Protocol" },
        damage: { value: 9800.0, type: "sim" }
      }),
      makeEntry({
        job: "GNB",
        role: "Tank",
        content: { category: "Ultimate", kind: "encounter", value: "Futures Rewritten" },
        damage: { value: 8700.0, type: "sim" }
      }),
      makeEntry({
        job: "GNB",
        role: "Tank",
        content: { category: "Ultimate", kind: "encounter", value: "The Omega Protocol" },
        damage: { value: 9900.0, type: "sim" }
      })
    ];

    const out = filterEntries(entries, makeFilters({ category: "Ultimate" }), {
      jobOrder: ["GNB", "DRK"],
      ultimateOrder: ["Futures Rewritten", "The Omega Protocol"]
    });

    expect(out.map((entry) => `${entry.job}|${entry.content.value}`)).toEqual([
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
        content: { category: "Ultimate", kind: "encounter", value: "The Omega Protocol" },
        damage: { value: 8200.0, type: "sim" }
      }),
      makeEntry({
        job: "DRK",
        role: "Tank",
        content: { category: "Ultimate", kind: "encounter", value: "Futures Rewritten" },
        damage: { value: 8100.0, type: "sim" }
      }),
      makeEntry({
        job: "DRK",
        role: "Tank",
        content: { category: "Savage", kind: "tier", value: "7.4" },
        damage: { value: 10100.0, type: "sim" }
      }),
      makeEntry({
        job: "DRK",
        role: "Tank",
        content: { category: "Criterion", kind: "encounter", value: "Another Aloalo Island" },
        damage: { value: 7000.0, type: "sim" }
      }),
      makeEntry({
        job: "DRK",
        role: "Tank",
        content: { category: "Criterion", kind: "encounter", value: "Another Mount Rokkon" },
        damage: { value: 7100.0, type: "sim" }
      })
    ];

    const out = filterEntries(entries, makeFilters({ job: "DRK" }), {
      categoryOrder: ["Savage", "Ultimate", "Criterion"] as Category[],
      ultimateOrder: ["Futures Rewritten", "The Omega Protocol"],
      criterionOrder: ["Another Aloalo Island", "Another Mount Rokkon"]
    });

    expect(out.map((entry) => `${entry.content.category}|${entry.content.kind === "encounter" ? entry.content.value : "-"}`)).toEqual([
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
        content: { category: "Ultimate", kind: "encounter", value: "Futures Rewritten" },
        note: { text: "with damage" },
        damage: { value: 9000.0, type: "sim" }
      }),
      makeEntry({
        job: "DRK",
        role: "Tank",
        content: { category: "Ultimate", kind: "encounter", value: "Futures Rewritten" },
        note: { text: "without damage" },
        damage: { value: null, type: "none" }
      })
    ];

    const out = filterEntries(entries, makeFilters({ category: "Ultimate" }), {
      jobOrder: ["DRK"],
      ultimateOrder: ["Futures Rewritten"]
    });

    expect(out[0].note?.text).toBe("with damage");
    expect(out[1].note?.text).toBe("without damage");
  });

  it("filters by criterion and unreal selectors", () => {
    const entries: BisEntry[] = [
      makeEntry({
        job: "DRK",
        role: "Tank",
        content: { category: "Criterion", kind: "encounter", value: "Another Mount Rokkon" }
      }),
      makeEntry({
        job: "DRK",
        role: "Tank",
        content: { category: "Criterion", kind: "encounter", value: "Another Aloalo Island" }
      }),
      makeEntry({
        job: "DRK",
        role: "Tank",
        content: { category: "Unreal", kind: "encounter", value: "Containment Bay S1T7 (Unreal)" }
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
    expect(criterionOut[0].content.value).toBe("Another Mount Rokkon");

    const unrealOut = filterEntries(
      entries,
      makeFilters({
        category: "Unreal",
        unreal: "Containment Bay S1T7 (Unreal)"
      })
    );
    expect(unrealOut).toHaveLength(1);
    expect(unrealOut[0].content.value).toBe("Containment Bay S1T7 (Unreal)");
  });

  it("for all filters=All, applies category ordering and category-specific encounter ordering", () => {
    const entries: BisEntry[] = [
      makeEntry({
        job: "DRK",
        role: "Tank",
        content: { category: "Criterion", kind: "encounter", value: "Another Mount Rokkon" },
        damage: { value: 7000.0, type: "sim" }
      }),
      makeEntry({
        job: "DRK",
        role: "Tank",
        content: { category: "Ultimate", kind: "encounter", value: "The Omega Protocol" },
        damage: { value: 8000.0, type: "sim" }
      }),
      makeEntry({
        job: "DRK",
        role: "Tank",
        content: { category: "Ultimate", kind: "encounter", value: "Futures Rewritten" },
        damage: { value: 7900.0, type: "sim" }
      }),
      makeEntry({
        job: "DRK",
        role: "Tank",
        content: { category: "Criterion", kind: "encounter", value: "Another Aloalo Island" },
        damage: { value: 7100.0, type: "sim" }
      }),
      makeEntry({
        job: "DRK",
        role: "Tank",
        content: { category: "Savage", kind: "tier", value: "7.4" },
        damage: { value: 9000.0, type: "sim" }
      })
    ];

    const out = filterEntries(entries, makeFilters(), {
      jobOrder: ["DRK"],
      categoryOrder: ["Savage", "Ultimate", "Criterion"] as Category[],
      ultimateOrder: ["Futures Rewritten", "The Omega Protocol"],
      criterionOrder: ["Another Aloalo Island", "Another Mount Rokkon"]
    });

    expect(out.map((entry) => `${entry.content.category}|${entry.content.kind === "encounter" ? entry.content.value : "-"}`)).toEqual([
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
        content: { category: "Savage", kind: "tier", value: "7.4" },
        damage: { value: null, type: "none" }
      }),
      makeEntry({
        job: "AAA",
        role: "Healer",
        content: { category: "Savage", kind: "tier", value: "7.4" },
        damage: { value: null, type: "none" }
      })
    ];

    const out = filterEntries(entries, makeFilters(), {
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
        content: { category: "Savage", kind: "tier", value: "7.4" },
        note: { text: "first" },
        damage: { value: null, type: "none" }
      }),
      makeEntry({
        job: "AAA",
        role: "Tank",
        content: { category: "Savage", kind: "tier", value: "7.4" },
        note: { text: "second" },
        damage: { value: null, type: "none" }
      })
    ];

    const out = filterEntries(entries, makeFilters(), {
      jobOrder: [],
      categoryOrder: []
    });

    expect(out).toHaveLength(2);
    expect(out.map((entry) => entry.note?.text)).toEqual(["first", "second"]);
  });

  it("rejects entries on job, ultimate, and unreal mismatch branches", () => {
    const jobMismatch = filterEntries(
      [makeEntry({ job: "DRK", content: { category: "Savage", kind: "tier", value: "7.4" } })],
      makeFilters({ job: "GNB" })
    );
    expect(jobMismatch).toHaveLength(0);

    const ultimateMismatch = filterEntries(
      [makeEntry({ content: { category: "Ultimate", kind: "encounter", value: "Futures Rewritten" } })],
      makeFilters({ category: "Ultimate", ultimate: "The Omega Protocol" })
    );
    expect(ultimateMismatch).toHaveLength(0);

    const unrealMismatch = filterEntries(
      [makeEntry({ content: { category: "Unreal", kind: "encounter", value: "Containment Bay S1T7 (Unreal)" } })],
      makeFilters({ category: "Unreal", unreal: "Another Unreal" })
    );
    expect(unrealMismatch).toHaveLength(0);
  });
});
