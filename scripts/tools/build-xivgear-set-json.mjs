#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const SLOT_KEY_MAP = {
  Weapon: "Weapon",
  Head: "Head",
  Chest: "Body",
  Body: "Body",
  Hands: "Hand",
  Hand: "Hand",
  Legs: "Legs",
  Feet: "Feet",
  Ear: "Ears",
  Ears: "Ears",
  Neck: "Neck",
  Wrist: "Wrist",
  Ring1: "RingRight",
  Ring2: "RingLeft",
  RingLeft: "RingLeft",
  RingRight: "RingRight"
};

const MATERIA_STAT_PREFIX = {
  DHT: "Heavens' Eye",
  CRT: "Savage Aim",
  DET: "Savage Might",
  SKS: "Quickarm"
};

function parseArgs(argv) {
  const parsed = {};
  let i = 0;
  while (i < argv.length) {
    const token = argv[i];
    if (!token.startsWith("--")) {
      i += 1;
      continue;
    }
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      parsed[key] = true;
      i += 1;
      continue;
    }
    parsed[key] = next;
    i += 2;
  }
  return parsed;
}

function toTitleCaseStat(input) {
  const raw = String(input ?? "")
    .trim()
    .toUpperCase()
    .replaceAll(/\s+/g, "");
  if (raw.includes("CRT")) {
    return "CRT";
  }
  if (raw.includes("DHT") || raw.includes("DH")) {
    return "DHT";
  }
  if (raw.includes("DET")) {
    return "DET";
  }
  if (raw.includes("SKS") || raw.includes("SS")) {
    return "SKS";
  }
  return null;
}

function parseMateriaToken(token) {
  const text = String(token ?? "").trim();
  if (!text) {
    return null;
  }
  const normalizedStat = toTitleCaseStat(text);
  if (!normalizedStat) {
    throw new Error(`Unsupported materia token: "${text}"`);
  }
  return normalizedStat;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Fetch failed (${response.status}) for ${url}`);
  }
  return await response.json();
}

function normalizeSpec(spec) {
  if (!spec || typeof spec !== "object") {
    throw new Error("Spec file must be a JSON object.");
  }
  if (!spec.name || typeof spec.name !== "string") {
    throw new Error('Spec is missing required field "name".');
  }
  if (!spec.job || typeof spec.job !== "string") {
    throw new Error('Spec is missing required field "job".');
  }
  if (!spec.level || typeof spec.level !== "number") {
    throw new Error('Spec is missing required numeric field "level".');
  }
  if (!spec.items || typeof spec.items !== "object" || Array.isArray(spec.items)) {
    throw new Error('Spec is missing required object field "items".');
  }
  return spec;
}

async function buildMateriaIdMap(targetValue) {
  const payload = await fetchJson("https://data.xivgear.app/Materia");
  const rows = payload.items ?? [];
  const out = {};

  for (const [stat, prefix] of Object.entries(MATERIA_STAT_PREFIX)) {
    const row = rows.find((entry) => entry.item?.[0]?.name?.startsWith(prefix));
    if (!row) {
      throw new Error(`Could not find materia row for stat ${stat}`);
    }
    const index = row.value.indexOf(targetValue);
    if (index === -1 || !row.item[index]?.rowId) {
      throw new Error(`Could not find ${targetValue} materia for stat ${stat}`);
    }
    out[stat] = row.item[index].rowId;
  }

  return out;
}

function resolveSlotKey(inputSlot) {
  const raw = String(inputSlot ?? "").trim();
  const compact = raw.replaceAll(/\s+/g, "");
  const key = SLOT_KEY_MAP[compact] ?? SLOT_KEY_MAP[raw];
  if (!key) {
    throw new Error(`Unsupported slot "${inputSlot}"`);
  }
  return key;
}

function nameKey(input) {
  return String(input ?? "")
    .trim()
    .toLowerCase();
}

function relaxedNameKey(input) {
  return String(input ?? "")
    .toLowerCase()
    .replaceAll(/\baug\.\b/g, "augmented")
    .replaceAll(/\bult\b/g, "ultimate")
    .replaceAll(/[^a-z0-9]+/g, " ")
    .trim()
    .replaceAll(/\s+/g, " ");
}

function resolveByNameWithFallback(entries, desiredName, label) {
  const byExact = entries.get(nameKey(desiredName));
  if (byExact) {
    return byExact;
  }

  const desiredRelaxed = relaxedNameKey(desiredName);
  for (const value of entries.values()) {
    if (relaxedNameKey(value.name) === desiredRelaxed) {
      return value;
    }
  }

  const desiredTokens = desiredRelaxed.split(" ").filter(Boolean);
  const partial = Array.from(entries.values()).find((value) => {
    const candidate = relaxedNameKey(value.name);
    return desiredTokens.every((tok) => candidate.includes(tok));
  });
  if (partial) {
    return partial;
  }

  throw new Error(`${label} not found: "${desiredName}"`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const specPath = args.spec ? path.resolve(args.spec) : null;
  const outPath = args.out ? path.resolve(args.out) : null;
  const templatePath = args.template ? path.resolve(args.template) : null;
  const materiaValue = args["materia-value"] ? Number(args["materia-value"]) : 54;

  if (!specPath) {
    throw new Error(
      "Usage: node scripts/build-xivgear-set-json.mjs --spec <path> [--out <path>] [--template <path>] [--materia-value 54]"
    );
  }
  if (!Number.isFinite(materiaValue) || materiaValue <= 0) {
    throw new Error("--materia-value must be a positive number.");
  }

  const specRaw = await fs.readFile(specPath, "utf8");
  const spec = normalizeSpec(JSON.parse(specRaw));

  let output = {
    name: spec.name,
    items: {},
    food: null,
    description: spec.description ?? "",
    isSeparator: false,
    job: spec.job,
    level: spec.level,
    sims: [],
    customItems: [],
    customFoods: [],
    partyBonus: 5,
    specialStats: null
  };

  if (templatePath) {
    const templateRaw = await fs.readFile(templatePath, "utf8");
    const template = JSON.parse(templateRaw);
    output = {
      ...template,
      name: spec.name,
      description: spec.description ?? template.description ?? "",
      job: spec.job,
      level: spec.level,
      items: {}
    };
  }

  const job = String(spec.job).trim().toUpperCase();
  const itemsPayload = await fetchJson(
    `https://data.xivgear.app/Items?job=${encodeURIComponent(job)}`
  );
  const foodPayload = await fetchJson("https://data.xivgear.app/Food");
  const materiaIdMap = await buildMateriaIdMap(materiaValue);

  const itemsByName = new Map((itemsPayload.items ?? []).map((row) => [nameKey(row.name), row]));
  const foodsByName = new Map((foodPayload.items ?? []).map((row) => [nameKey(row.name), row]));

  for (const [slotInput, slotDef] of Object.entries(spec.items)) {
    const slotKey = resolveSlotKey(slotInput);
    if (!slotDef || typeof slotDef !== "object") {
      throw new Error(`Slot "${slotInput}" must be an object with item/materia.`);
    }

    const itemName = slotDef.item ?? slotDef.name;
    if (!itemName) {
      throw new Error(`Slot "${slotInput}" is missing "item".`);
    }
    const item = resolveByNameWithFallback(itemsByName, itemName, `Item for slot "${slotInput}"`);

    const materiaTokens = Array.isArray(slotDef.materia) ? slotDef.materia : [];
    const materia = materiaTokens.map((token) => {
      const stat = parseMateriaToken(token);
      const materiaId = materiaIdMap[stat];
      return { id: materiaId, locked: false };
    });

    output.items[slotKey] = {
      id: item.rowId,
      materia
    };
  }

  if (spec.food) {
    const food = resolveByNameWithFallback(foodsByName, spec.food, "Food");
    output.food = food.rowId;
  }

  const serialized = `${JSON.stringify(output, null, 2)}\n`;
  if (outPath) {
    await fs.writeFile(outPath, serialized, "utf8");
    console.log(`Wrote XIVGear JSON: ${outPath}`);
  } else {
    process.stdout.write(serialized);
  }
}

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
