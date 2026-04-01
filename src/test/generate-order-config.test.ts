import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { buildGeneratedTs, generateOrderConfigFile, validateOrderConfig } from "../../scripts/tools/lib/generate-order-config.mjs";

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

describe("generate-order-config", () => {
  it("validates an order array and returns it", () => {
    const order = validateOrderConfig({ order: ["A", "B"] }, "sample");
    expect(order).toEqual(["A", "B"]);
  });

  it("rejects duplicate names", () => {
    expect(() => validateOrderConfig({ order: ["A", "A"] }, "sample")).toThrow("duplicate");
  });

  it("builds generated TypeScript content", () => {
    const output = buildGeneratedTs({
      sourcePath: "src/config/sample.json",
      constName: "SAMPLE_ORDER",
      typeName: "Sample",
      order: ["One", "Two"]
    });

    expect(output).toContain('export const SAMPLE_ORDER = [');
    expect(output).toContain('"One"');
    expect(output).toContain('export type Sample = (typeof SAMPLE_ORDER)[number];');
  });

  it("writes generated file from input json", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "xiv-bis-gen-"));
    tempDirs.push(tempDir);
    const inputPath = path.join(tempDir, "input.json");
    const outputPath = path.join(tempDir, "output.ts");

    await fs.writeFile(inputPath, JSON.stringify({ order: ["X", "Y"] }), "utf8");

    await generateOrderConfigFile({
      rootDir: tempDir,
      inputPath,
      outputPath,
      label: "sample",
      constName: "SAMPLE_ORDER",
      typeName: "Sample"
    });

    const generated = await fs.readFile(outputPath, "utf8");
    expect(generated).toContain("Source: input.json");
    expect(generated).toContain("export const SAMPLE_ORDER");
  });
});
