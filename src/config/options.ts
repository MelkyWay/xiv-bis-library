import type { Role } from "../types/bis";
import { JOB_ORDER, JOB_TO_ROLE } from "./jobs";
import { ROLE_ORDER } from "./roles";

export const JOB_GROUPS_BY_ROLE: Array<{ role: Role; jobs: string[] }> = ROLE_ORDER.map((role) => ({
  role,
  jobs: JOB_ORDER.filter((job) => JOB_TO_ROLE[job] === role)
}));
