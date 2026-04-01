import type { Role } from "../types/bis";

const ROLE_COLOR_BY_ROLE: Partial<Record<Role, string>> = {
  Tank: "var(--role-tank)",
  Healer: "var(--role-healer)",
  Melee: "var(--role-melee)",
  "Magical Ranged": "var(--role-magical)",
  "Physical Ranged": "var(--role-physical)"
};

export function roleColorVar(role: Role | "All" | undefined): string | null {
  if (!role || role === "All") {
    return null;
  }
  return ROLE_COLOR_BY_ROLE[role] ?? null;
}

export function roleColorTextStyle(role: Role | "All" | undefined): Record<string, string> {
  return { color: roleColorVar(role) ?? "var(--color-text)" };
}

export function roleColorBorder(role: Role | "All" | undefined): string {
  return roleColorVar(role) ?? "var(--color-input-border)";
}
