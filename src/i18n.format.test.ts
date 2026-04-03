import { describe, expect, it } from "vitest";
import { formatHeaderUpdatedDateByLocale } from "./i18n";

describe("formatHeaderUpdatedDateByLocale", () => {
  it("formats French and German with day first", () => {
    expect(formatHeaderUpdatedDateByLocale("2026-04-03", "fr")).toBe("03-04-2026");
    expect(formatHeaderUpdatedDateByLocale("2026-04-03", "de-DE")).toBe("03.04.2026");
  });

  it("formats Chinese and Korean with locale-specific patterns", () => {
    expect(formatHeaderUpdatedDateByLocale("2026-04-03", "zh-CN")).toBe("2026-04-03");
    expect(formatHeaderUpdatedDateByLocale("2026-04-03", "zh-TW")).toBe("2026/04/03");
    expect(formatHeaderUpdatedDateByLocale("2026-04-03", "ko-KR")).toBe("2026. 4. 3.");
  });

  it("keeps original value for unsupported locales or malformed values", () => {
    expect(formatHeaderUpdatedDateByLocale("2026-04-03", "en")).toBe("2026-04-03");
    expect(formatHeaderUpdatedDateByLocale("bad-date", "fr")).toBe("bad-date");
  });
});
