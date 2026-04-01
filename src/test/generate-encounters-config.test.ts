import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  buildEncountersGeneratedTs,
  generateEncountersConfigFile,
  validateEncountersConfig
} from "../../scripts/tools/lib/generate-encounters-config.mjs";

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

describe("generate-encounters-config", () => {
  it("validates encounter config structure", () => {
    const data = validateEncountersConfig({
      encounters: {
        ultimate: ["U1", "U0"],
        criterion: ["C1"],
        unreal: []
      }
    });
    expect(data.ultimateOrder).toEqual(["U1", "U0"]);
    expect(data.criterionOrder).toEqual(["C1"]);
  });

  it("rejects invalid structure", () => {
    expect(() => validateEncountersConfig({ encounters: [] })).toThrow("encounters object");
  });

  it("rejects duplicate encounter names", () => {
    expect(() =>
      validateEncountersConfig({
        encounters: {
          ultimate: ["U1"],
          criterion: ["U1"],
          unreal: []
        }
      })
    ).toThrow("Duplicate encounter name");
  });

  it("builds generated TS output", () => {
    const output = buildEncountersGeneratedTs("src/config/encounters.json", {
      encounters: [{ name: "U1", category: "Ultimate", order: 1 }],
      ultimateOrder: ["U1"],
      criterionOrder: ["C1"],
      unrealOrder: ["X1"]
    });
    expect(output).toContain("export const ENCOUNTERS");
    expect(output).toContain("export const ULTIMATE_ORDER");
    expect(output).toContain("export const CRITERION_ORDER");
    expect(output).toContain("export const UNREAL_ORDER");
    expect(output).toContain("export type EncounterCategory");
    expect(output).toContain("export type UltimateEncounter");
  });

  it("writes generated file from json input", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "xiv-bis-enc-"));
    tempDirs.push(tempDir);

    const inputPath = path.join(tempDir, "encounters.json");
    const outputPath = path.join(tempDir, "encounters.generated.ts");
    await fs.writeFile(
      inputPath,
      JSON.stringify({ encounters: { ultimate: ["U1"], criterion: ["C1"], unreal: [] } }),
      "utf8"
    );

    await generateEncountersConfigFile({
      rootDir: tempDir,
      inputPath,
      outputPath
    });

    const generated = await fs.readFile(outputPath, "utf8");
    expect(generated).toContain("Source: encounters.json");
    expect(generated).toContain("ENCOUNTERS");
    expect(generated).toContain("ULTIMATE_ORDER");
    expect(generated).toContain("CRITERION_ORDER");
  });
});
