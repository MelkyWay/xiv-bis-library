#!/usr/bin/env node

import path from "node:path";
import { generateJobsConfigFile } from "./lib/generate-jobs-config.mjs";

const ROOT = process.cwd();
const INPUT_PATH = path.resolve(ROOT, "src/config/jobs.json");
const ROLES_PATH = path.resolve(ROOT, "src/config/roles.json");
const OUTPUT_PATH = path.resolve(ROOT, "src/config/jobs.generated.ts");

try {
  await generateJobsConfigFile({
    rootDir: ROOT,
    inputPath: INPUT_PATH,
    rolesPath: ROLES_PATH,
    outputPath: OUTPUT_PATH
  });
  console.log(`Generated ${path.relative(ROOT, OUTPUT_PATH)}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
