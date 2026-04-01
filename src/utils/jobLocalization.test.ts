import { describe, expect, it } from "vitest";
import { localizeJobName } from "./jobLocalization";

describe("localizeJobName", () => {
  it("returns Korean job names when locale is ko", () => {
    expect(localizeJobName("DRK", "ko")).toBe("암흑기사");
    expect(localizeJobName("WHM", "ko-KR")).toBe("백마도사");
  });

  it("falls back to code for unsupported locale or unknown job", () => {
    expect(localizeJobName("DRK", "en")).toBe("DRK");
    expect(localizeJobName("XYZ", "ko")).toBe("XYZ");
  });
});
