import fs from "node:fs/promises";
import path from "node:path";

function validateStringArray(value, label) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${label} must be a non-empty string array.`);
  }
  for (const item of value) {
    if (typeof item !== "string" || !item.trim()) {
      throw new Error(`${label} contains an invalid value.`);
    }
  }
}

export function validateEncountersConfig(config) {
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    throw new Error("encounters.json must be an object.");
  }

  validateStringArray(config.ultimateOrder, "ultimateOrder");
  validateStringArray(config.criterionOrder, "criterionOrder");

  return {
    ultimateOrder: config.ultimateOrder,
    criterionOrder: config.criterionOrder
  };
}

export function buildEncountersGeneratedTs(sourcePath, data) {
  return `// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Source: ${sourcePath}

export const ULTIMATE_ORDER = ${JSON.stringify(data.ultimateOrder, null, 2)} as const;
export const CRITERION_ORDER = ${JSON.stringify(data.criterionOrder, null, 2)} as const;
export type UltimateEncounter = (typeof ULTIMATE_ORDER)[number];
`;
}

export async function generateEncountersConfigFile({
  rootDir,
  inputPath,
  outputPath
}) {
  const raw = await fs.readFile(inputPath, "utf8");
  const parsed = JSON.parse(raw);
  const validated = validateEncountersConfig(parsed);
  const relativeSourcePath = path.relative(rootDir, inputPath).replaceAll("\\", "/");
  const output = buildEncountersGeneratedTs(relativeSourcePath, validated);
  await fs.writeFile(outputPath, output, "utf8");
}
