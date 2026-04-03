import { describe, expect, it } from "vitest";
import { localizeEncounterName, localizeUltimateName } from "./ultimateLocalization";

describe("localizeUltimateName", () => {
  it("returns localized ultimate names for known encounters", () => {
    expect(localizeUltimateName("The Omega Protocol", "fr")).toBe("Le Protocole Oméga");
    expect(localizeUltimateName("The Epic of Alexander", "ja")).toBe("絶アレキサンダー討滅戦");
    expect(localizeUltimateName("The Omega Protocol", "ko")).toBe("절 오메가 검증전");
  });

  it("falls back to original name for unknown encounters", () => {
    expect(localizeUltimateName("Unknown Encounter", "fr")).toBe("Unknown Encounter");
  });
});

describe("localizeEncounterName", () => {
  it("localizes criterion and unreal encounters when translations are available", () => {
    expect(localizeEncounterName("Another Mount Rokkon", "fr", "Criterion")).toBe(
      "Le mont Rokkon annexe - Donjon alternatif"
    );
    expect(localizeEncounterName("Another Mount Rokkon", "de", "Criterion")).toBe("Der kuriose Rokkon");
    expect(localizeEncounterName("Another Mount Rokkon", "ja", "Criterion")).toBe("アナザーダンジョン 異聞六根山");
    expect(localizeEncounterName("Another Mount Rokkon", "zh-CN", "Criterion")).toBe("异闻六根山");
    expect(localizeEncounterName("Another Mount Rokkon", "zh-TW", "Criterion")).toBe("異聞六根山");
    expect(localizeEncounterName("Tsukuyomi's Pain", "zh", "Unreal")).toBe("月读幻巧战");
    expect(localizeEncounterName("Tsukuyomi's Pain", "ko", "Unreal")).toBe("환 츠쿠요미 토벌전");
  });

  it("falls back to english when locale translations are not configured", () => {
    expect(localizeEncounterName("Unknown Encounter", "ko", "Criterion")).toBe("Unknown Encounter");
    expect(localizeEncounterName("Another Merchant's Tale", "zh-TW", "Criterion")).toBe("Another Merchant's Tale");
  });

  it("can infer category from configured encounter name", () => {
    expect(localizeEncounterName("The Omega Protocol", "zh")).toBe("欧米茄绝境验证战");
  });
});
