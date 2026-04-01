import { ENCOUNTERS } from "./encounters.generated";
export { ULTIMATE_ORDER, CRITERION_ORDER, UNREAL_ORDER } from "./encounters.generated";
export type EncounterName = (typeof ENCOUNTERS)[number]["name"];
export type EncounterCategory = (typeof ENCOUNTERS)[number]["category"];

export const ENCOUNTER_CATEGORY_BY_NAME: Record<EncounterName, EncounterCategory> = Object.fromEntries(
  ENCOUNTERS.map((encounter) => [encounter.name, encounter.category])
) as Record<EncounterName, EncounterCategory>;
