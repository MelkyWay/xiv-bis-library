import { CRITERION_ORDER, ENCOUNTER_CATEGORY_BY_NAME, ULTIMATE_ORDER, UNREAL_ORDER } from "../config/encounters";
import { JOB_ORDER, JOB_TO_ROLE } from "../config/jobs";
import { CATEGORY_ORDER } from "../config/orders";
import { ROLE_ORDER } from "../config/roles";
import type { BisDataFile, BisEntry, Category, Role } from "../types/bis";

const VALID_ROLES: ReadonlySet<Role> = new Set<Role>(ROLE_ORDER);

const VALID_CATEGORIES: ReadonlySet<Category> = new Set<Category>(CATEGORY_ORDER);
const VALID_JOBS: ReadonlySet<string> = new Set<string>(JOB_ORDER);

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const VERSION_RE = /^\d+\.\d+$/;
const URL_RE = /^https?:\/\//i;
const SCHEMA_VERSION = 1;

function expectedContentKind(category: Category): "tier" | "encounter" {
  if (category === "Ultimate" || category === "Criterion" || category === "Unreal" || category === "Other") {
    return "encounter";
  }
  return "tier";
}

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

  if (!isRecord(value.content)) {
    return false;
  }

  if (typeof value.content.category !== "string" || !VALID_CATEGORIES.has(value.content.category as Category)) {
    return false;
  }

  if (value.content.kind !== "tier" && value.content.kind !== "encounter") {
    return false;
  }

  if (!hasText(value.content.value)) {
    return false;
  }

  if (expectedContentKind(value.content.category as Category) !== value.content.kind) {
    return false;
  }

  if (value.content.kind === "tier" && !VERSION_RE.test(value.content.value)) {
    return false;
  }

  if (typeof value.updatedAt !== "string" || !DATE_RE.test(value.updatedAt)) {
    return false;
  }

  if (typeof value.importedAt !== "string" || !DATE_RE.test(value.importedAt)) {
    return false;
  }

  if (!URL_RE.test(value.link.url) || !URL_RE.test(value.source.url)) {
    return false;
  }

  if (value.note !== undefined) {
    if (!isRecord(value.note) || !hasText(value.note.text)) {
      return false;
    }
    if (value.note.tooltip !== undefined && value.note.tooltip !== null && typeof value.note.tooltip !== "string") {
      return false;
    }
  }

  if (value.damage !== undefined) {
    if (!isRecord(value.damage)) {
      return false;
    }
    if (value.damage.type !== "sim" && value.damage.type !== "potency" && value.damage.type !== "none") {
      return false;
    }
    if (value.damage.type === "none" && value.damage.value !== null) {
      return false;
    }
    if (
      value.damage.type !== "none" &&
      (typeof value.damage.value !== "number" || !Number.isFinite(value.damage.value))
    ) {
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

  if (input.schemaVersion !== SCHEMA_VERSION) {
    errors.push(`Invalid or missing schemaVersion (expected ${SCHEMA_VERSION}).`);
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

  const configuredUltimateNames = new Set<string>(ULTIMATE_ORDER);
  const configuredCriterionNames = new Set<string>(CRITERION_ORDER);
  const configuredUnrealNames = new Set<string>(UNREAL_ORDER);

  const validEntries: BisEntry[] = [];
  for (const { entry, index } of structurallyValidEntries) {
    if (!VALID_JOBS.has(entry.job)) {
      errors.push(`Invalid entry at index ${index}; unknown job "${entry.job}". It has been ignored.`);
      continue;
    }

    if (JOB_TO_ROLE[entry.job as keyof typeof JOB_TO_ROLE] !== entry.role) {
      errors.push(
        `Invalid entry at index ${index}; role "${entry.role}" does not match configured role for job "${entry.job}". It has been ignored.`
      );
      continue;
    }

    if (entry.content.category === "Ultimate") {
      const encounter = entry.content.value;
      if (!configuredUltimateNames.has(encounter)) {
        errors.push(`Invalid entry at index ${index}; unknown ultimate "${encounter}". It has been ignored.`);
        continue;
      }
      if (ENCOUNTER_CATEGORY_BY_NAME[encounter as keyof typeof ENCOUNTER_CATEGORY_BY_NAME] !== "Ultimate") {
        errors.push(
          `Invalid entry at index ${index}; encounter "${encounter}" is not mapped to category Ultimate. It has been ignored.`
        );
        continue;
      }
    }

    if (entry.content.category === "Criterion") {
      const encounter = entry.content.value;
      if (!configuredCriterionNames.has(encounter)) {
        errors.push(`Invalid entry at index ${index}; unknown criterion "${encounter}". It has been ignored.`);
        continue;
      }
      if (ENCOUNTER_CATEGORY_BY_NAME[encounter as keyof typeof ENCOUNTER_CATEGORY_BY_NAME] !== "Criterion") {
        errors.push(
          `Invalid entry at index ${index}; encounter "${encounter}" is not mapped to category Criterion. It has been ignored.`
        );
        continue;
      }
    }

    if (entry.content.category === "Unreal") {
      const encounter = entry.content.value;
      if (!configuredUnrealNames.has(encounter)) {
        errors.push(`Invalid entry at index ${index}; unknown unreal "${encounter}". It has been ignored.`);
        continue;
      }
      if (ENCOUNTER_CATEGORY_BY_NAME[encounter as keyof typeof ENCOUNTER_CATEGORY_BY_NAME] !== "Unreal") {
        errors.push(
          `Invalid entry at index ${index}; encounter "${encounter}" is not mapped to category Unreal. It has been ignored.`
        );
        continue;
      }
    }

    validEntries.push(entry);
  }

  return {
    data: {
      schemaVersion: SCHEMA_VERSION,
      lastUpdated: input.lastUpdated,
      entries: validEntries
    },
    errors
  };
}
