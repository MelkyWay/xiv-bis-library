#!/usr/bin/env node

import path from "node:path";
import { generateOrderConfigFile } from "./lib/generate-order-config.mjs";

const ROOT = process.cwd();
const INPUT_PATH = path.resolve(ROOT, "src/config/roles.json");
const OUTPUT_PATH = path.resolve(ROOT, "src/config/roles.generated.ts");

try {
  await generateOrderConfigFile({
    rootDir: ROOT,
    inputPath: INPUT_PATH,
    outputPath: OUTPUT_PATH,
    label: "roles",
    constName: "ROLE_ORDER",
    typeName: "Role"
  });
  console.log(`Generated ${path.relative(ROOT, OUTPUT_PATH)}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
