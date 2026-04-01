#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const INPUT_PATH = path.resolve(ROOT, "src/config/categories.json");
const OUTPUT_PATH = path.resolve(ROOT, "src/config/categories.generated.ts");

function toLiteral(value) {
  return JSON.stringify(value);
}

function validateCategoriesConfig(config) {
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    throw new Error("categories.json must be an object.");
  }

  const order = config.order;
  if (!Array.isArray(order) || order.length === 0) {
    throw new Error("categories.json must include a non-empty 'order' array.");
  }

  for (const category of order) {
    if (typeof category !== "string" || category.trim().length === 0) {
      throw new Error("Every category in 'order' must be a non-empty string.");
    }
  }

  const uniqueCount = new Set(order).size;
  if (uniqueCount !== order.length) {
    throw new Error("categories.json contains duplicate category names.");
  }

  return order;
}

function buildOutput(order) {
  const tupleLines = order.map((category) => `  ${toLiteral(category)},`).join("\n");
  return `// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Source: src/config/categories.json

export const CATEGORY_ORDER = [
${tupleLines}
] as const;

export type Category = (typeof CATEGORY_ORDER)[number];
`;
}

async function main() {
  const raw = await fs.readFile(INPUT_PATH, "utf8");
  const parsed = JSON.parse(raw);
  const order = validateCategoriesConfig(parsed);

  const output = buildOutput(order);
  await fs.writeFile(OUTPUT_PATH, output, "utf8");
  console.log(`Generated ${path.relative(ROOT, OUTPUT_PATH)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
