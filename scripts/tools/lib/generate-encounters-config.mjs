import fs from "node:fs/promises";
import path from "node:path";

function validateEncounterNameList(value, label) {
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array.`);
  }
  const out = [];
  for (const [index, item] of value.entries()) {
    if (typeof item !== "string" || !item.trim()) {
      throw new Error(`${label}[${index}] must be a non-empty string.`);
    }
    out.push(item);
  }
  return out;
}

function normalizeEncounterItemsByTree(tree) {
  const ultimate = validateEncounterNameList(tree.ultimate, "encounters.ultimate");
  const criterion = validateEncounterNameList(tree.criterion, "encounters.criterion");
  const unreal = validateEncounterNameList(tree.unreal, "encounters.unreal");

  const encounters = [
    ...ultimate.map((name, index) => ({ name, category: "Ultimate", order: index + 1 })),
    ...criterion.map((name, index) => ({ name, category: "Criterion", order: index + 1 })),
    ...unreal.map((name, index) => ({ name, category: "Unreal", order: index + 1 }))
  ];

  const seenNames = new Set();
  for (const encounter of encounters) {
    const key = encounter.name.toLowerCase();
    if (seenNames.has(key)) {
      throw new Error(`Duplicate encounter name "${encounter.name}" in encounters.json.`);
    }
    seenNames.add(key);
  }

  return {
    encounters,
    ultimateOrder: ultimate,
    criterionOrder: criterion,
    unrealOrder: unreal
  };
}

export function validateEncountersConfig(config) {
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    throw new Error("encounters.json must be an object.");
  }

  if (!config.encounters || typeof config.encounters !== "object" || Array.isArray(config.encounters)) {
    throw new Error("encounters.json must contain an encounters object.");
  }

  return normalizeEncounterItemsByTree(config.encounters);
}

export function buildEncountersGeneratedTs(sourcePath, data) {
  return `// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Source: ${sourcePath}

export const ENCOUNTERS = ${JSON.stringify(data.encounters, null, 2)} as const;
export const ULTIMATE_ORDER = ${JSON.stringify(data.ultimateOrder, null, 2)} as const;
export const CRITERION_ORDER = ${JSON.stringify(data.criterionOrder, null, 2)} as const;
export const UNREAL_ORDER = ${JSON.stringify(data.unrealOrder, null, 2)} as const;
export type EncounterCategory = (typeof ENCOUNTERS)[number]["category"];
export type EncounterName = (typeof ENCOUNTERS)[number]["name"];
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
