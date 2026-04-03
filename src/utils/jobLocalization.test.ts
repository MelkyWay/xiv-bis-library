import { describe, expect, it } from "vitest";
import { localizeJobName } from "./jobLocalization";

describe("localizeJobName", () => {
  it("returns French job abbreviations when locale is fr", () => {
    expect(localizeJobName("DRK", "fr")).toBe("CHN");
    expect(localizeJobName("WHM", "fr-FR")).toBe("MBL");
    expect(localizeJobName("DNC", "fr")).toBe("DNS");
  });

  it("returns German job abbreviations when locale is de", () => {
    expect(localizeJobName("DRK", "de")).toBe("DKR");
    expect(localizeJobName("WHM", "de-DE")).toBe("WMA");
    expect(localizeJobName("MNK", "de")).toBe("MÖN");
  });

  it("returns Simplified Chinese job names when locale is zh-CN", () => {
    expect(localizeJobName("DRK", "zh-CN")).toBe("暗黑骑士");
    expect(localizeJobName("WHM", "zh")).toBe("白魔法师");
    expect(localizeJobName("RPR", "zh-Hans")).toBe("钐镰客");
  });

  it("returns Traditional Chinese job names when locale is zh-TW", () => {
    expect(localizeJobName("DRK", "zh-TW")).toBe("暗黑騎士");
    expect(localizeJobName("WHM", "zh-Hant")).toBe("白魔道士");
    expect(localizeJobName("RPR", "zh-tw")).toBe("奪魂者");
  });

  it("returns Korean job names when locale is ko", () => {
    expect(localizeJobName("DRK", "ko")).toBe("암흑기사");
    expect(localizeJobName("WHM", "ko-KR")).toBe("백마도사");
  });

  it("falls back to code for unsupported locale or unknown job", () => {
    expect(localizeJobName("DRK", "en")).toBe("DRK");
    expect(localizeJobName("XYZ", "ko")).toBe("XYZ");
    expect(localizeJobName("XYZ", "fr")).toBe("XYZ");
    expect(localizeJobName("XYZ", "de")).toBe("XYZ");
    expect(localizeJobName("XYZ", "zh-CN")).toBe("XYZ");
    expect(localizeJobName("XYZ", "zh-TW")).toBe("XYZ");
  });
});
