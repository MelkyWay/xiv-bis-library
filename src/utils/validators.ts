import type { BisDataFile, BisEntry, Category, Role } from "../types/bis";

const VALID_ROLES = new Set<Role>([
  "Tank",
  "Healer",
  "Melee",
  "Physical Ranged",
  "Magical Ranged",
  "Limited"
]);

const VALID_CATEGORIES = new Set<Category>([
  "Savage",
  "Ultimate",
  "Criterion",
  "Unreal",
  "Occult Crescent",
  "Prog",
  "Other"
]);

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const VERSION_RE = /^\d+\.\d+$/;
const URL_RE = /^https?:\/\//i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isBisEntry(value: unknown): value is BisEntry {
  if (!isRecord(value)) {
    return false;
  }

  if (!hasText(value.job) || !hasText(value.sourceName) || !hasText(value.sourceUrl)) {
    return false;
  }

  if (typeof value.role !== "string" || !VALID_ROLES.has(value.role as Role)) {
    return false;
  }

  if (typeof value.category !== "string" || !VALID_CATEGORIES.has(value.category as Category)) {
    return false;
  }

  if (value.ultimate !== undefined && typeof value.ultimate !== "string") {
    return false;
  }

  if (value.criterionName !== undefined && typeof value.criterionName !== "string") {
    return false;
  }

  if (value.unrealName !== undefined && typeof value.unrealName !== "string") {
    return false;
  }

  if (value.otherName !== undefined && typeof value.otherName !== "string") {
    return false;
  }

  if (value.category === "Ultimate" && !hasText(value.ultimate)) {
    return false;
  }

  if (value.category === "Criterion" && !hasText(value.criterionName)) {
    return false;
  }

  if (value.category === "Unreal" && !hasText(value.unrealName)) {
    return false;
  }

  if (value.category === "Other" && !hasText(value.otherName)) {
    return false;
  }

  if (typeof value.tier !== "string" || !VERSION_RE.test(value.tier)) {
    return false;
  }

  if (typeof value.updatedAt !== "string" || !DATE_RE.test(value.updatedAt)) {
    return false;
  }

  if (!URL_RE.test(value.sourceUrl)) {
    return false;
  }

  if (value.notes !== undefined && typeof value.notes !== "string") {
    return false;
  }

  if (value.notesTooltip !== undefined && typeof value.notesTooltip !== "string") {
    return false;
  }

  if (value.simDps !== undefined && typeof value.simDps !== "string") {
    return false;
  }

  return true;
}

export function validateBisData(input: unknown): { data?: BisDataFile; errors: string[] } {
  const errors: string[] = [];

  if (!isRecord(input)) {
    return { errors: ["Data file is not an object."] };
  }

  if (typeof input.lastUpdated !== "string" || !DATE_RE.test(input.lastUpdated)) {
    errors.push("Invalid or missing lastUpdated (expected YYYY-MM-DD).");
  }

  if (
    input.ultimateNames !== undefined &&
    (!Array.isArray(input.ultimateNames) || input.ultimateNames.some((name) => !hasText(name)))
  ) {
    errors.push("Invalid ultimateNames (expected array of non-empty strings).");
  }

  if (
    input.criterionNames !== undefined &&
    (!Array.isArray(input.criterionNames) || input.criterionNames.some((name) => !hasText(name)))
  ) {
    errors.push("Invalid criterionNames (expected array of non-empty strings).");
  }

  if (
    input.unrealNames !== undefined &&
    (!Array.isArray(input.unrealNames) || input.unrealNames.some((name) => !hasText(name)))
  ) {
    errors.push("Invalid unrealNames (expected array of non-empty strings).");
  }

  if (!Array.isArray(input.entries)) {
    errors.push("Invalid or missing entries array.");
    return { errors };
  }

  const validEntries: BisEntry[] = [];
  input.entries.forEach((entry, index) => {
    if (isBisEntry(entry)) {
      validEntries.push(entry);
      return;
    }

    errors.push(`Invalid entry at index ${index}; it has been ignored.`);
  });

  if (typeof input.lastUpdated !== "string") {
    return { errors };
  }

  return {
    data: {
      lastUpdated: input.lastUpdated,
      ultimateNames: Array.isArray(input.ultimateNames)
        ? input.ultimateNames.filter((name): name is string => hasText(name))
        : undefined,
      criterionNames: Array.isArray(input.criterionNames)
        ? input.criterionNames.filter((name): name is string => hasText(name))
        : undefined,
      unrealNames: Array.isArray(input.unrealNames)
        ? input.unrealNames.filter((name): name is string => hasText(name))
        : undefined,
      entries: validEntries
    },
    errors
  };
}
