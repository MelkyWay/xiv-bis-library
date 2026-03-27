export type Role =
  | "Tank"
  | "Healer"
  | "Melee"
  | "Physical Ranged"
  | "Magical Ranged"
  | "Limited";

export type Category = "Savage" | "Ultimate" | "Criterion" | "Unreal" | "Occult Crescent" | "Prog" | "Other";

export interface BisEntry {
  job: string;
  role: Role;
  category: Category;
  ultimate?: string;
  criterionName?: string;
  unrealName?: string;
  otherName?: string;
  tier: string;
  sourceName: string;
  sourceUrl: string;
  notes?: string;
  notesTooltip?: string;
  simDps?: string;
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
