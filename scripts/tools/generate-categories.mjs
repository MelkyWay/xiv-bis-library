#!/usr/bin/env node

import path from "node:path";
import { generateOrderConfigFile } from "./lib/generate-order-config.mjs";

const ROOT = process.cwd();
const INPUT_PATH = path.resolve(ROOT, "src/config/categories.json");
const OUTPUT_PATH = path.resolve(ROOT, "src/config/categories.generated.ts");

async function main() {
  await generateOrderConfigFile({
    rootDir: ROOT,
    inputPath: INPUT_PATH,
    outputPath: OUTPUT_PATH,
    label: "categories",
    constName: "CATEGORY_ORDER",
    typeName: "Category"
  });
  console.log(`Generated ${path.relative(ROOT, OUTPUT_PATH)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
