import { JOBS, type JobCode } from "./jobs.generated";
import type { Role } from "../types/bis";

export const JOB_ORDER: JobCode[] = JOBS.map((job) => job.code);
export const JOB_TO_ROLE: Record<JobCode, Role> = Object.fromEntries(JOBS.map((job) => [job.code, job.role])) as Record<
  JobCode,
  Role
>;
