import { ROLE_ORDER as GENERATED_ROLE_ORDER, type Role } from "./roles.generated";

export const ROLE_ORDER: Role[] = [...GENERATED_ROLE_ORDER];
export const ROLE_OPTIONS: Array<"All" | Role> = ["All", ...ROLE_ORDER];
