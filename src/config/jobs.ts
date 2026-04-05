import { JOBS, type JobCode } from "./jobs.generated";
import type { Role } from "../types/bis";
import { ROLE_ORDER } from "./roles";

export const JOB_ORDER: JobCode[] = JOBS.map((job) => job.code);
export const JOB_TO_ROLE: Record<JobCode, Role> = Object.fromEntries(JOBS.map((job) => [job.code, job.role])) as Record<
  JobCode,
  Role
>;

export const JOB_GROUPS_BY_ROLE: Array<{ role: Role; jobs: string[] }> = ROLE_ORDER.map((role) => ({
  role,
  jobs: JOB_ORDER.filter((job) => JOB_TO_ROLE[job] === role)
}));
