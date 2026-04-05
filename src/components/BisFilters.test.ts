import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import type { BisFiltersState } from "../types/bis";
import { createTestI18n } from "../test/createTest18n";
import BisFilters from "./BisFilters.vue";

function buildFilters(overrides: Partial<BisFiltersState> = {}): BisFiltersState {
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

function mountFilters(filters: BisFiltersState = buildFilters()) {
  return mount(BisFilters, {
    props: {
      filters,
      groupedJobs: [
        { role: "Tank", label: "Tanks", jobs: ["DRK", "GNB"] },
        { role: "Healer", label: "Healers", jobs: ["SCH"] }
      ],
      ultimates: ["Futures Rewritten", "The Omega Protocol"],
      criterions: ["Another Aloalo Island"],
      unreals: ["Containment Bay S1T7 (Unreal)"],
      roleByJob: {
        DRK: "Tank",
        GNB: "Tank",
        SCH: "Healer"
      },
      favoritesOnly: false
    },
    global: {
      plugins: [createTestI18n()]
    }
  });
}

describe("BisFilters", () => {
  it("emits role update from custom role menu", async () => {
    const wrapper = mountFilters();

    await wrapper.get(".role-select-trigger").trigger("click");
    await wrapper.findAll(".role-select-option")[1].trigger("click");

    const events = wrapper.emitted<{"update:filters": [BisFiltersState]}>()["update:filters"];
    expect(events).toBeTruthy();
    expect(events[0][0].role).toBe("Tank");
  });

  it("emits category update from custom category menu", async () => {
    const wrapper = mountFilters();

    await wrapper.get(".category-select-trigger").trigger("click");
    await wrapper.findAll(".category-select-option")[1].trigger("click");

    const events = wrapper.emitted<{"update:filters": [BisFiltersState]}>()["update:filters"];
    expect(events).toBeTruthy();
    expect(events[0][0].category).toBe("Savage");
  });

  it("emits reset values when clicking reset", async () => {
    const wrapper = mountFilters(
      buildFilters({
        role: "Tank",
        category: "Ultimate",
        job: "DRK",
        query: "abc"
      })
    );

    await wrapper.get("button.reset-filters").trigger("click");

    const events = wrapper.emitted<{"update:filters": [BisFiltersState]}>()["update:filters"];
    expect(events).toBeTruthy();
    expect(events[0][0]).toEqual(buildFilters());
  });

  it("shows secondary selector for Ultimate and emits selected option", async () => {
    const wrapper = mountFilters(buildFilters({ category: "Ultimate" }));

    expect(wrapper.find(".ultimate-select-wrap.is-hidden").exists()).toBe(false);

    await wrapper.get(".ultimate-select-wrap .secondary-select-trigger").trigger("click");
    await wrapper.findAll(".ultimate-select-wrap .secondary-select-option")[1].trigger("click");

    const events = wrapper.emitted<{"update:filters": [BisFiltersState]}>()["update:filters"];
    expect(events).toBeTruthy();
    expect(events[0][0].ultimate).toBe("Futures Rewritten");
  });

  it("emits favorites-only toggle", async () => {
    const wrapper = mountFilters();

    await wrapper.get("button.favorites-toggle").trigger("click");

    expect(wrapper.emitted("toggle:favorites-only")).toHaveLength(1);
  });
});
