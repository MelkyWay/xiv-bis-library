import { CRITERION_ORDER, ULTIMATE_ORDER } from "../config/encounters";
import { CATEGORY_ORDER } from "../config/orders";
import { ROLE_ORDER } from "../config/roles";
import type { BisDataFile, BisEntry, Category, Role } from "../types/bis";

const VALID_ROLES: ReadonlySet<Role> = new Set<Role>(ROLE_ORDER);

const VALID_CATEGORIES: ReadonlySet<Category> = new Set<Category>(CATEGORY_ORDER);

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

  if (!hasText(value.job) || !isRecord(value.link) || !isRecord(value.source)) {
    return false;
  }

  if (!hasText(value.link.name) || !hasText(value.link.url)) {
    return false;
  }

  if (!hasText(value.source.name) || !hasText(value.source.url)) {
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

  if (!URL_RE.test(value.link.url) || !URL_RE.test(value.source.url)) {
    return false;
  }

  if (value.notes !== undefined && typeof value.notes !== "string") {
    return false;
  }

  if (value.notesTooltip !== undefined && typeof value.notesTooltip !== "string") {
    return false;
  }

  if (value.damage !== undefined) {
    if (!isRecord(value.damage)) {
      return false;
    }
    if (typeof value.damage.value !== "string") {
      return false;
    }
    if (value.damage.type !== "sim" && value.damage.type !== "potency" && value.damage.type !== "none") {
      return false;
    }
    if (value.damage.type === "none" && value.damage.value !== "-") {
      return false;
    }
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

  const structurallyValidEntries: Array<{ entry: BisEntry; index: number }> = [];
  input.entries.forEach((entry, index) => {
    if (isBisEntry(entry)) {
      structurallyValidEntries.push({ entry, index });
      return;
    }

    errors.push(`Invalid entry at index ${index}; it has been ignored.`);
  });

  if (typeof input.lastUpdated !== "string") {
    return { errors };
  }

  const sanitizedUltimateNames = Array.isArray(input.ultimateNames)
    ? input.ultimateNames.filter((name): name is string => hasText(name))
    : undefined;
  const sanitizedCriterionNames = Array.isArray(input.criterionNames)
    ? input.criterionNames.filter((name): name is string => hasText(name))
    : undefined;
  const sanitizedUnrealNames = Array.isArray(input.unrealNames)
    ? input.unrealNames.filter((name): name is string => hasText(name))
    : undefined;

  const dataDerivedUltimateNames = structurallyValidEntries
    .filter(({ entry }) => entry.category === "Ultimate" && hasText(entry.ultimate))
    .map(({ entry }) => entry.ultimate as string);
  const dataDerivedCriterionNames = structurallyValidEntries
    .filter(({ entry }) => entry.category === "Criterion" && hasText(entry.criterionName))
    .map(({ entry }) => entry.criterionName as string);
  const dataDerivedUnrealNames = structurallyValidEntries
    .filter(({ entry }) => entry.category === "Unreal" && hasText(entry.unrealName))
    .map(({ entry }) => entry.unrealName as string);

  const allowedUltimateNames = new Set(sanitizedUltimateNames ?? dataDerivedUltimateNames);
  const allowedCriterionNames = new Set(sanitizedCriterionNames ?? dataDerivedCriterionNames);
  const allowedUnrealNames = new Set(sanitizedUnrealNames ?? dataDerivedUnrealNames);
  const configuredUltimateNames = new Set<string>(ULTIMATE_ORDER);
  const configuredCriterionNames = new Set<string>(CRITERION_ORDER);

  const validEntries: BisEntry[] = [];
  for (const { entry, index } of structurallyValidEntries) {
    if (entry.category === "Ultimate") {
      const encounter = entry.ultimate as string;
      if (!configuredUltimateNames.has(encounter)) {
        errors.push(`Invalid entry at index ${index}; unknown ultimate "${encounter}". It has been ignored.`);
        continue;
      }
      if (!allowedUltimateNames.has(encounter)) {
        errors.push(`Invalid entry at index ${index}; ultimate "${encounter}" is not declared in ultimateNames.`);
        continue;
      }
    }

    if (entry.category === "Criterion") {
      const encounter = entry.criterionName as string;
      if (!configuredCriterionNames.has(encounter)) {
        errors.push(`Invalid entry at index ${index}; unknown criterion "${encounter}". It has been ignored.`);
        continue;
      }
      if (!allowedCriterionNames.has(encounter)) {
        errors.push(`Invalid entry at index ${index}; criterion "${encounter}" is not declared in criterionNames.`);
        continue;
      }
    }

    if (entry.category === "Unreal") {
      const encounter = entry.unrealName as string;
      if (!allowedUnrealNames.has(encounter)) {
        errors.push(`Invalid entry at index ${index}; unreal "${encounter}" is not declared in unrealNames.`);
        continue;
      }
    }

    validEntries.push(entry);
  }

  return {
    data: {
      lastUpdated: input.lastUpdated,
      ultimateNames: sanitizedUltimateNames,
      criterionNames: sanitizedCriterionNames,
      unrealNames: sanitizedUnrealNames,
      entries: validEntries
    },
    errors
  };
}
