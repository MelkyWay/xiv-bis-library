import fs from "node:fs/promises";
import path from "node:path";

function toLiteral(value) {
  return JSON.stringify(value);
}

export function validateOrderConfig(config, label) {
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    throw new Error(`${label}.json must be an object.`);
  }

  const order = config.order;
  if (!Array.isArray(order) || order.length === 0) {
    throw new Error(`${label}.json must include a non-empty 'order' array.`);
  }

  for (const item of order) {
    if (typeof item !== "string" || item.trim().length === 0) {
      throw new Error(`Every item in ${label}.json 'order' must be a non-empty string.`);
    }
  }

  const uniqueCount = new Set(order).size;
  if (uniqueCount !== order.length) {
    throw new Error(`${label}.json contains duplicate names.`);
  }

  return order;
}

export function buildGeneratedTs({ sourcePath, constName, typeName, order }) {
  const tupleLines = order.map((item) => `  ${toLiteral(item)},`).join("\n");
  return `// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Source: ${sourcePath}

export const ${constName} = [
${tupleLines}
] as const;

export type ${typeName} = (typeof ${constName})[number];
`;
}

export async function generateOrderConfigFile({
  rootDir,
  inputPath,
  outputPath,
  label,
  constName,
  typeName
}) {
  const raw = await fs.readFile(inputPath, "utf8");
  const parsed = JSON.parse(raw);
  const order = validateOrderConfig(parsed, label);
  const relativeSourcePath = path.relative(rootDir, inputPath).replaceAll("\\", "/");
  const output = buildGeneratedTs({
    sourcePath: relativeSourcePath,
    constName,
    typeName,
    order
  });
  await fs.writeFile(outputPath, output, "utf8");
}
