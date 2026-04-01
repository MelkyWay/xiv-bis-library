#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const INPUT_PATH = path.resolve(ROOT, "src/config/roles.json");
const OUTPUT_PATH = path.resolve(ROOT, "src/config/roles.generated.ts");

function toLiteral(value) {
  return JSON.stringify(value);
}

function validateRolesConfig(config) {
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    throw new Error("roles.json must be an object.");
  }

  const order = config.order;
  if (!Array.isArray(order) || order.length === 0) {
    throw new Error("roles.json must include a non-empty 'order' array.");
  }

  for (const role of order) {
    if (typeof role !== "string" || role.trim().length === 0) {
      throw new Error("Every role in 'order' must be a non-empty string.");
    }
  }

  const uniqueCount = new Set(order).size;
  if (uniqueCount !== order.length) {
    throw new Error("roles.json contains duplicate role names.");
  }

  return order;
}

function buildOutput(order) {
  const tupleLines = order.map((role) => `  ${toLiteral(role)},`).join("\n");
  return `// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Source: src/config/roles.json

export const ROLE_ORDER = [
${tupleLines}
] as const;

export type Role = (typeof ROLE_ORDER)[number];
`;
}

async function main() {
  const raw = await fs.readFile(INPUT_PATH, "utf8");
  const parsed = JSON.parse(raw);
  const order = validateRolesConfig(parsed);

  const output = buildOutput(order);
  await fs.writeFile(OUTPUT_PATH, output, "utf8");
  console.log(`Generated ${path.relative(ROOT, OUTPUT_PATH)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
