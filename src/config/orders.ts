import { CATEGORY_ORDER as GENERATED_CATEGORY_ORDER, type Category } from "./categories.generated";

export const CATEGORY_ORDER: Category[] = [...GENERATED_CATEGORY_ORDER];
export const CATEGORY_OPTIONS: Array<"All" | Category> = ["All", ...CATEGORY_ORDER];

export const ULTIMATE_ORDER = [
  "Futures Rewritten",
  "The Omega Protocol",
  "Dragonsong's Reprise",
  "The Epic of Alexander",
  "The Weapon's Refrain",
  "The Unending Coil of Bahamut"
] as const;

export const CRITERION_ORDER = [
  "Another Merchant's Tale",
  "Another Aloalo Island",
  "Another Mount Rokkon",
  "Another Sil'dihn Subterrane"
] as const;
