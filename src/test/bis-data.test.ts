import bisData from "../../public/data/bis-links.json";
import { describe, expect, it } from "vitest";
import { validateBisData } from "../utils/validators";

describe("public data file", () => {
  it("passes validator checks", () => {
    const result = validateBisData(bisData);
    expect(result.errors).toHaveLength(0);
    expect(result.data?.entries).toHaveLength(bisData.entries.length);
  });
});
