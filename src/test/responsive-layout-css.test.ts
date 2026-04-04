import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const stylePath = path.resolve(process.cwd(), "src/style.css");
const styleCss = fs.readFileSync(stylePath, "utf8");

describe("responsive layout css guardrails", () => {
  it("keeps tablet filter grid split into 4-col and 3-col ranges with anchored actions", () => {
    const fourColBlock = /@media\s*\(max-width:\s*1100px\)\s*and\s*\(min-width:\s*901px\)\s*\{[\s\S]*?\.filters\s*\{[\s\S]*?grid-template-columns:\s*repeat\(4,\s*minmax\(160px,\s*1fr\)\);[\s\S]*?\}[\s\S]*?\.filters\s+\.actions\s*\{[\s\S]*?grid-column:\s*4;[\s\S]*?\}[\s\S]*?\}/m;
    const threeColBlock = /@media\s*\(max-width:\s*900px\)\s*and\s*\(min-width:\s*641px\)\s*\{[\s\S]*?\.filters\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3,\s*minmax\(160px,\s*1fr\)\);[\s\S]*?\}[\s\S]*?\.filters\s+\.actions\s*\{[\s\S]*?grid-column:\s*3;[\s\S]*?\}[\s\S]*?\}/m;

    expect(styleCss).toMatch(fourColBlock);
    expect(styleCss).toMatch(threeColBlock);
  });

  it("enables table horizontal scroll only at <=1023px with sticky first column", () => {
    const tableResponsiveBlock = /@media\s*\(max-width:\s*1023px\)\s*\{[\s\S]*?\.table-scroll\s*\{[\s\S]*?overflow-x:\s*auto;[\s\S]*?\}[\s\S]*?\.table-wrap\s+thead\s+th\.col-job\s*\{[\s\S]*?position:\s*sticky;[\s\S]*?\}[\s\S]*?\.table-wrap\s+tbody\s+td\.col-job\s*\{[\s\S]*?position:\s*sticky;[\s\S]*?\}[\s\S]*?\}/m;

    expect(styleCss).toMatch(tableResponsiveBlock);
  });
});
