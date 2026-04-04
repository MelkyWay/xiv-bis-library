import { describe, expect, it } from "vitest";
import { localizeEncounterName, localizeUltimateName } from "./ultimateLocalization";

describe("localizeUltimateName", () => {
  it("returns localized ultimate names for known encounters", () => {
    expect(localizeUltimateName("The Omega Protocol", "fr")).toContain("Le Protocole");
    expect(localizeUltimateName("The Epic of Alexander", "ja")).not.toBe("The Epic of Alexander");
    expect(localizeUltimateName("The Omega Protocol", "ko")).not.toBe("The Omega Protocol");
  });

  it("falls back to original name for unknown encounters", () => {
    expect(localizeUltimateName("Unknown Encounter", "fr")).toBe("Unknown Encounter");
  });
});

describe("localizeEncounterName", () => {
  it("localizes criterion and unreal encounters when translations are available", () => {
    expect(localizeEncounterName("Another Mount Rokkon", "fr", "Criterion")).toBe("Le Mont Rokkon");
    expect(localizeEncounterName("Another Mount Rokkon", "de", "Criterion")).toBe("Der kuriose Rokkon");
    expect(localizeEncounterName("Another Mount Rokkon", "ja", "Criterion")).not.toBe("Another Mount Rokkon");
    expect(localizeEncounterName("Tsukuyomi's Pain", "zh", "Unreal")).not.toBe("Tsukuyomi's Pain");
    expect(localizeEncounterName("Tsukuyomi's Pain", "ko", "Unreal")).not.toBe("Tsukuyomi's Pain");
  });

  it("falls back to english when locale translations are not configured", () => {
    expect(localizeEncounterName("Unknown Encounter", "ko", "Criterion")).toBe("Unknown Encounter");
    expect(localizeEncounterName("Tsukuyomi's Pain", "ja", "Unreal")).toBe("Tsukuyomi's Pain");
  });

  it("can infer category from configured encounter name", () => {
    expect(localizeEncounterName("The Omega Protocol", "zh")).not.toBe("The Omega Protocol");
  });
});
