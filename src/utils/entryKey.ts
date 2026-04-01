import type { BisEntry } from "../types/bis";

export function getEntryKey(entry: BisEntry): string {
  return [entry.job, entry.category, entry.encounter ?? "", entry.link.url].join("||");
}
