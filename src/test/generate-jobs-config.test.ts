import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { buildJobsGeneratedTs, generateJobsConfigFile, validateJobsConfig } from "../../scripts/tools/lib/generate-jobs-config.mjs";

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

describe("generate-jobs-config", () => {
  it("validates jobs against known roles and uppercases codes", () => {
    const jobs = validateJobsConfig(
      { jobs: [{ code: "drk", role: "Tank" }] },
      new Set(["Tank", "Healer"])
    );
    expect(jobs).toEqual([{ code: "DRK", role: "Tank" }]);
  });

  it("rejects unknown roles", () => {
    expect(() =>
      validateJobsConfig({ jobs: [{ code: "DRK", role: "Unknown" }] }, new Set(["Tank", "Healer"]))
    ).toThrow('unknown role');
  });

  it("builds generated TS output", () => {
    const output = buildJobsGeneratedTs("src/config/jobs.json", [{ code: "DRK", role: "Tank" }]);
    expect(output).toContain('export const JOBS =');
    expect(output).toContain('"DRK"');
    expect(output).toContain('export type JobCode = (typeof JOBS)[number]["code"];');
  });

  it("writes generated file from json inputs", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "xiv-bis-jobs-"));
    tempDirs.push(tempDir);

    const jobsPath = path.join(tempDir, "jobs.json");
    const rolesPath = path.join(tempDir, "roles.json");
    const outPath = path.join(tempDir, "jobs.generated.ts");

    await fs.writeFile(jobsPath, JSON.stringify({ jobs: [{ code: "drk", role: "Tank" }] }), "utf8");
    await fs.writeFile(rolesPath, JSON.stringify({ order: ["Tank", "Healer"] }), "utf8");

    await generateJobsConfigFile({
      rootDir: tempDir,
      inputPath: jobsPath,
      rolesPath,
      outputPath: outPath
    });

    const generated = await fs.readFile(outPath, "utf8");
    expect(generated).toContain("Source: jobs.json");
    expect(generated).toContain('"DRK"');
  });
});
