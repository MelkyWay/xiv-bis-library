import fs from "node:fs/promises";
import path from "node:path";

export function validateJobsConfig(config, validRoles) {
  const jobs = Array.isArray(config?.jobs) ? config.jobs : null;
  if (!jobs || jobs.length === 0) {
    throw new Error("jobs.json must contain a non-empty jobs array.");
  }

  for (const job of jobs) {
    if (!job || typeof job !== "object") {
      throw new Error("Invalid job entry in jobs.json.");
    }
    if (typeof job.code !== "string" || !job.code.trim()) {
      throw new Error("Each job must have a non-empty code.");
    }
    if (typeof job.role !== "string" || !job.role.trim()) {
      throw new Error(`Job ${job.code} must have a non-empty role.`);
    }
    if (validRoles && validRoles.size > 0 && !validRoles.has(job.role)) {
      throw new Error(`Job ${job.code} has unknown role "${job.role}".`);
    }
  }

  const unique = new Set(jobs.map((job) => String(job.code).toUpperCase()));
  if (unique.size !== jobs.length) {
    throw new Error("jobs.json contains duplicate job codes.");
  }

  return jobs.map((job) => ({
    code: String(job.code).toUpperCase(),
    role: String(job.role)
  }));
}

export function buildJobsGeneratedTs(sourcePath, jobs) {
  const serialized = JSON.stringify(jobs, null, 2);
  return `// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Source: ${sourcePath}

export const JOBS = ${serialized} as const;

export type JobCode = (typeof JOBS)[number]["code"];
`;
}

export async function generateJobsConfigFile({
  rootDir,
  inputPath,
  rolesPath,
  outputPath
}) {
  const raw = await fs.readFile(inputPath, "utf8");
  const parsed = JSON.parse(raw);
  const rolesRaw = await fs.readFile(rolesPath, "utf8");
  const rolesParsed = JSON.parse(rolesRaw);
  const validRoles = new Set(Array.isArray(rolesParsed?.order) ? rolesParsed.order : []);
  const jobs = validateJobsConfig(parsed, validRoles);

  const relativeSourcePath = path.relative(rootDir, inputPath).replaceAll("\\", "/");
  const output = buildJobsGeneratedTs(relativeSourcePath, jobs);
  await fs.writeFile(outputPath, output, "utf8");
}
