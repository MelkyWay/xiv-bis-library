import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { generateIssueTemplates } from "../../scripts/tools/lib/generate-issue-templates.mjs";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map(async (dir) => {
      try {
        await fs.rm(dir, { recursive: true, force: true });
      } catch {
        // best effort cleanup
      }
    })
  );
});

function countOccurrences(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1;
}

describe("generate-issue-templates", () => {
  it("localizes encounter labels and omits category prefixes in localized templates", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "xiv-bis-issue-templates-"));
    tempDirs.push(tempDir);

    const testFileDir = path.dirname(fileURLToPath(import.meta.url));
    const rootDir = path.resolve(testFileDir, "../..");

    await generateIssueTemplates({
      rootDir,
      outputDir: tempDir
    });

    const jaTemplatePath = path.join(tempDir, "40-report-broken-link.ja.yml");
    const jaTemplate = await fs.readFile(jaTemplatePath, "utf8");

    expect(jaTemplate).toContain('"絶もうひとつの未来"');
    expect(jaTemplate).toContain('"異聞アロアロ島"');
    expect(jaTemplate).not.toContain('"絶 - Futures Rewritten"');
    expect(jaTemplate).not.toContain('"異聞 - Another Aloalo Island"');
  });

  it("deduplicates identical encounter values in dropdown options", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "xiv-bis-issue-templates-"));
    tempDirs.push(tempDir);

    const testFileDir = path.dirname(fileURLToPath(import.meta.url));
    const rootDir = path.resolve(testFileDir, "../..");

    await generateIssueTemplates({
      rootDir,
      outputDir: tempDir
    });

    const enTemplatePath = path.join(tempDir, "10-report-broken-link.en.yml");
    const enTemplate = await fs.readFile(enTemplatePath, "utf8");

    expect(countOccurrences(enTemplate, '        - "7.4"')).toBe(1);
  });
});
