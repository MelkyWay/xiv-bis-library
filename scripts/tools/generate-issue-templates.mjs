#!/usr/bin/env node

import path from "node:path";
import { generateIssueTemplates } from "./lib/generate-issue-templates.mjs";

const ROOT = process.cwd();
const OUTPUT_DIR = path.resolve(ROOT, ".github/ISSUE_TEMPLATE");

try {
  await generateIssueTemplates({
    rootDir: ROOT,
    outputDir: OUTPUT_DIR
  });
  console.log(`Generated issue templates in ${path.relative(ROOT, OUTPUT_DIR)}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
