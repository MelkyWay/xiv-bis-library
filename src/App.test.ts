import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App.vue";
import { createTestI18n } from "./test/i18n";

const mockData = {
  schemaVersion: 1,
  lastUpdated: "2026-03-29",
  entries: [
    {
      job: "DRK",
      role: "Tank",
      content: {
        category: "Savage",
        kind: "tier",
        value: "7.4"
      },
      link: { name: "XivGear", url: "https://xivgear.app/drk" },
      source: { name: "The Balance", url: "https://www.thebalanceffxiv.com" },
      importedAt: "2026-03-29",
      updatedAt: "2026-03-29",
      note: { text: "drk row" },
      damage: { value: 1000.0, type: "sim" }
    },
    {
      job: "GNB",
      role: "Tank",
      content: {
        category: "Savage",
        kind: "tier",
        value: "7.4"
      },
      link: { name: "XivGear", url: "https://xivgear.app/gnb" },
      source: { name: "The Balance", url: "https://www.thebalanceffxiv.com" },
      importedAt: "2026-03-29",
      updatedAt: "2026-03-29",
      note: { text: "gnb row" },
      damage: { value: 900.0, type: "sim" }
    }
  ]
};

describe("App", () => {
  beforeEach(() => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockData
    } as Response);
  });

  it("loads data, toggles favorite, and filters to favorites only", async () => {
    localStorage.setItem("theme", "dark");
    const wrapper = mount(App, {
      global: {
        plugins: [createTestI18n()]
      }
    });

    await flushPromises();
    await flushPromises();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(wrapper.text()).toContain("Showing 1-2 of 2");

    const favoriteButtons = wrapper.findAll(".favorite-btn");
    await favoriteButtons[0].trigger("click");

    await wrapper.get(".favorites-toggle").trigger("click");
    await flushPromises();

    const visibleRows = wrapper.findAll("tbody tr");
    expect(visibleRows).toHaveLength(1);
    expect(wrapper.text()).toContain("drk row");
    expect(wrapper.text()).not.toContain("gnb row");
  });
});
