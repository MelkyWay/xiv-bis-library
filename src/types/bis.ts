export type Role =
  | "Tank"
  | "Healer"
  | "Melee"
  | "Physical Ranged"
  | "Magical Ranged"
  | "Limited";

export type Category = "Savage" | "Ultimate" | "Criterion" | "Unreal" | "Occult Crescent" | "Prog" | "Other";
export type DamageType = "sim" | "potency" | "none";

export interface DamageValue {
  value: string;
  type: DamageType;
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
  ultimate?: string;
  criterionName?: string;
  unrealName?: string;
  otherName?: string;
  tier: string;
  link: LinkValue;
  source: SourceValue;
  notes?: string;
  notesTooltip?: string;
  damage?: DamageValue;
  updatedAt: string;
}

export interface BisDataFile {
  lastUpdated: string;
  ultimateNames?: string[];
  criterionNames?: string[];
  unrealNames?: string[];
  entries: BisEntry[];
}

export interface BisFiltersState {
  role: "All" | Role;
  category: "All" | Category;
  job: "All" | string;
  ultimate: "All" | string;
  criterion: "All" | string;
  unreal: "All" | string;
  query: string;
}
