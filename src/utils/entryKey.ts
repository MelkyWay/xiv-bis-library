import type { BisEntry } from "../types/bis";

export function getEntryKey(entry: BisEntry): string {
  return [entry.job, entry.content.category, entry.content.kind, entry.content.value, entry.link.url].join("||");
}
