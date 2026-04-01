import { describe, expect, it } from "vitest";
import { localizeUltimateName } from "./ultimateLocalization";

describe("localizeUltimateName", () => {
  it("returns localized ultimate names for known encounters", () => {
    expect(localizeUltimateName("The Omega Protocol", "fr")).toBe("Le Protocole Oméga");
    expect(localizeUltimateName("The Epic of Alexander", "ja")).toBe("絶アレキサンダー討滅戦");
  });

  it("falls back to original name for unknown encounters", () => {
    expect(localizeUltimateName("Unknown Encounter", "fr")).toBe("Unknown Encounter");
  });
});
