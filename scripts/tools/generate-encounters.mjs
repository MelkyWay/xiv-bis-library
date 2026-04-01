#!/usr/bin/env node

import path from "node:path";
import { generateEncountersConfigFile } from "./lib/generate-encounters-config.mjs";

const ROOT = process.cwd();
const INPUT_PATH = path.resolve(ROOT, "src/config/encounters.json");
const OUTPUT_PATH = path.resolve(ROOT, "src/config/encounters.generated.ts");

async function main() {
  await generateEncountersConfigFile({
    rootDir: ROOT,
    inputPath: INPUT_PATH,
    outputPath: OUTPUT_PATH
  });
  console.log(`Generated ${path.relative(ROOT, OUTPUT_PATH)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
