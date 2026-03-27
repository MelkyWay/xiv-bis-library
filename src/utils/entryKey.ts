import type { BisEntry } from "../types/bis";

export function getEntryKey(entry: BisEntry): string {
  return [
    entry.job,
    entry.category,
    entry.ultimate ?? "",
    entry.criterionName ?? "",
    entry.unrealName ?? "",
    entry.otherName ?? "",
    entry.sourceUrl
  ].join("||");
}
