import type { Category } from "../types/bis";

export const CATEGORY_ORDER: Category[] = ["Savage", "Prog", "Ultimate", "Criterion", "Unreal", "Occult Crescent", "Other"];

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
