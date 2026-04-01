import type { Category as GeneratedCategory } from "../config/categories.generated";
import type { Role as GeneratedRole } from "../config/roles.generated";

export type Role = GeneratedRole;

export type Category = GeneratedCategory;
export type DamageType = "sim" | "potency" | "none";

export interface DamageValue {
  value: number | null;
  type: DamageType;
}

export interface NoteValue {
  text: string;
  tooltip?: string | null;
}

export interface LinkValue {
  name: string;
  url: string;
}

export interface SourceValue {
  name: string;
  url: string;
}

export interface BisEntry {
  job: string;
  role: Role;
  category: Category;
  encounter?: string;
  tier: string;
  link: LinkValue;
  source: SourceValue;
  note?: NoteValue;
  damage?: DamageValue;
  importedAt: string;
  updatedAt: string;
}

export interface BisDataFile {
  schemaVersion: 1;
  lastUpdated: string;
  entries: BisEntry[];
}

export interface BisFiltersState {
  role: "All" | Role;
  category: "All" | Category;
  job: string;
  ultimate: string;
  criterion: string;
  unreal: string;
  query: string;
}
