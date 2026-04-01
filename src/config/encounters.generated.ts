// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Source: src/config/encounters.json

export const ENCOUNTERS = [
  {
    "name": "Futures Rewritten",
    "category": "Ultimate",
    "order": 1
  },
  {
    "name": "The Omega Protocol",
    "category": "Ultimate",
    "order": 2
  },
  {
    "name": "Dragonsong's Reprise",
    "category": "Ultimate",
    "order": 3
  },
  {
    "name": "The Epic of Alexander",
    "category": "Ultimate",
    "order": 4
  },
  {
    "name": "The Weapon's Refrain",
    "category": "Ultimate",
    "order": 5
  },
  {
    "name": "The Unending Coil of Bahamut",
    "category": "Ultimate",
    "order": 6
  },
  {
    "name": "Another Merchant's Tale",
    "category": "Criterion",
    "order": 1
  },
  {
    "name": "Another Aloalo Island",
    "category": "Criterion",
    "order": 2
  },
  {
    "name": "Another Mount Rokkon",
    "category": "Criterion",
    "order": 3
  },
  {
    "name": "Another Sil'dihn Subterrane",
    "category": "Criterion",
    "order": 4
  },
  {
    "name": "Tsukuyomi's Pain",
    "category": "Unreal",
    "order": 1
  }
] as const;
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
export const UNREAL_ORDER = [
  "Tsukuyomi's Pain"
] as const;
export type EncounterCategory = (typeof ENCOUNTERS)[number]["category"];
export type EncounterName = (typeof ENCOUNTERS)[number]["name"];
export type UltimateEncounter = (typeof ULTIMATE_ORDER)[number];
