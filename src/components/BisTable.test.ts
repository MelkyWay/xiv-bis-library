import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { createTestI18n } from "../test/i18n";
import type { BisEntry } from "../types/bis";
import BisTable from "./BisTable.vue";

function makeEntry(overrides: Partial<BisEntry> = {}): BisEntry {
  return {
    job: "DRK",
    role: "Tank",
    content: {
      category: "Savage",
      kind: "tier",
      value: "7.4"
    },
    link: { name: "XivGear", url: "https://xivgear.app/base" },
    source: { name: "The Balance", url: "https://www.thebalanceffxiv.com" },
    importedAt: "2026-03-29",
    updatedAt: "2026-03-29",
    damage: { value: null, type: "none" },
    ...overrides
  };
}

function mountTable(rows: BisEntry[], activeCategory: "All" | BisEntry["content"]["category"] = "All") {
  return mount(BisTable, {
    props: {
      rows,
      activeCategory,
      favoriteEntryKeys: new Set<string>()
    },
    global: {
      plugins: [createTestI18n()]
    }
  });
}

describe("BisTable", () => {
  it("shows damage superscript type and tooltip content", () => {
    const wrapper = mountTable([
      makeEntry({
        link: { name: "XivGear", url: "https://xivgear.app/sim" },
        damage: { value: 12345.67, type: "sim" }
      }),
      makeEntry({
        link: { name: "XivGear", url: "https://xivgear.app/potency" },
        damage: { value: 456.78, type: "potency" }
      })
    ]);

    const badges = wrapper.findAll(".damage-kind-badge");
    expect(badges).toHaveLength(2);
    expect(badges[0].text()).toBe("S");
    expect(badges[0].attributes("data-tooltip")).toBe("Level 100 sim");
    expect(badges[1].text()).toBe("P");
    expect(badges[1].attributes("data-tooltip")).toBe("dmg/100 potency");
  });

  it("shows '-' and no damage badge when damage is none", () => {
    const wrapper = mountTable([
      makeEntry({
        damage: { value: null, type: "none" }
      })
    ]);

    expect(wrapper.text()).toContain("-");
    expect(wrapper.find(".damage-kind-badge").exists()).toBe(false);
  });

  it("renders note text and tooltip from note object", () => {
    const wrapper = mountTable([
      makeEntry({
        note: {
          text: "2.50 GCD",
          tooltip: "Sample tooltip"
        }
      })
    ]);

    const anchor = wrapper.get(".notes-main-tooltip");
    expect(anchor.text()).toContain("2.50 GCD");
    expect(anchor.attributes("data-tooltip")).toBe("Sample tooltip");
  });

  it("sorts by damage descending on first click", async () => {
    const wrapper = mountTable([
      makeEntry({
        link: { name: "XivGear", url: "https://xivgear.app/low" },
        note: { text: "low" },
        damage: { value: 100.0, type: "sim" }
      }),
      makeEntry({
        link: { name: "XivGear", url: "https://xivgear.app/high" },
        note: { text: "high" },
        damage: { value: 999.0, type: "sim" }
      })
    ]);

    await wrapper.get(".sortable-header").trigger("click");

    const rows = wrapper.findAll("tbody tr");
    expect(rows[0].text()).toContain("high");
    expect(rows[1].text()).toContain("low");
  });

  it("paginates rows with 100 entries per page", async () => {
    const rows = Array.from({ length: 101 }, (_, index) =>
      makeEntry({
        link: { name: "XivGear", url: `https://xivgear.app/${index}` },
        note: { text: `row-${index}` }
      })
    );
    const wrapper = mountTable(rows);

    expect(wrapper.findAll("tbody tr")).toHaveLength(100);
    expect(wrapper.text()).toContain("Showing 1-100 of 101");

    const nextButton = wrapper.get('button[aria-label="Next page"]');
    await nextButton.trigger("click");

    const pagedRows = wrapper.findAll("tbody tr");
    expect(pagedRows).toHaveLength(1);
    expect(wrapper.text()).toContain("Showing 101-101 of 101");
  });

  it("emits favorite toggle and copies link", async () => {
    const wrapper = mountTable([makeEntry()]);
    const copySpy = vi.spyOn(navigator.clipboard, "writeText");

    await wrapper.get(".favorite-btn").trigger("click");
    await wrapper.get(".copy-link-btn").trigger("click");

    const favoriteEvents = wrapper.emitted("toggle-favorite");
    expect(favoriteEvents).toHaveLength(1);
    expect(copySpy).toHaveBeenCalledWith("https://xivgear.app/base");
  });

  it("hides Category column when a specific category is selected", () => {
    const wrapper = mountTable(
      [
        makeEntry({
          content: {
            category: "Ultimate",
            kind: "encounter",
            value: "Futures Rewritten"
          }
        })
      ],
      "Ultimate"
    );

    expect(wrapper.findAll("thead th").some((cell) => cell.text() === "Category")).toBe(false);
    expect(wrapper.findAll("tbody tr td").some((cell) => cell.text() === "Ultimate")).toBe(false);
  });

  it("uses correct empty-state colspan depending on category filter", () => {
    const allWrapper = mountTable([], "All");
    const allColspan = allWrapper.get("tbody tr td").attributes("colspan");
    expect(allColspan).toBe("9");

    const ultimateWrapper = mountTable([], "Ultimate");
    const ultimateColspan = ultimateWrapper.get("tbody tr td").attributes("colspan");
    expect(ultimateColspan).toBe("8");
  });
});
