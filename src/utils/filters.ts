import { ROLE_ORDER } from "../config/roles";
import type { BisEntry, BisFiltersState } from "../types/bis";

const ROLE_ORDER_INDEX: Map<string, number> = new Map(ROLE_ORDER.map((role, index) => [role, index + 1]));

function parseSimDps(value: number | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  return Number.isFinite(value) ? value : null;
}

type OrderIndex = Map<string, number>;
type EntryComparator = (a: BisEntry, b: BisEntry) => number;

export interface SortContext {
  ultimateOrder?: string[];
  criterionOrder?: string[];
  categoryOrder?: string[];
  jobOrder?: string[];
}

function buildOrderIndex(items: string[] = []): OrderIndex {
  return new Map(items.map((name, index) => [name, index]));
}

function compareByOrder(aKey: string | undefined, bKey: string | undefined, orderIndex: OrderIndex): number {
  const aIndex = aKey ? orderIndex.get(aKey) : undefined;
  const bIndex = bKey ? orderIndex.get(bKey) : undefined;

  if (aIndex !== undefined && bIndex !== undefined && aIndex !== bIndex) {
    return aIndex - bIndex;
  }

  if (aIndex === undefined && bIndex !== undefined) return 1;
  if (aIndex !== undefined && bIndex === undefined) return -1;
  return 0;
}

function compareSimDpsDesc(a: BisEntry, b: BisEntry): number {
  const aSim = parseSimDps(a.damage?.value);
  const bSim = parseSimDps(b.damage?.value);

  if (aSim !== null && bSim !== null && aSim !== bSim) {
    return bSim - aSim;
  }

  if (aSim === null && bSim !== null) return 1;
  if (aSim !== null && bSim === null) return -1;
  return 0;
}

function compareJobsByPickerOrder(a: BisEntry, b: BisEntry, jobOrderIndex: OrderIndex): number {
  const byPickerOrder = compareByOrder(a.job, b.job, jobOrderIndex);
  if (byPickerOrder !== 0) {
    return byPickerOrder;
  }
  return a.job.localeCompare(b.job);
}

function composeComparators(...comparators: EntryComparator[]): EntryComparator {
  return (a, b) => {
    for (const comparator of comparators) {
      const result = comparator(a, b);
      if (result !== 0) {
        return result;
      }
    }
    return 0;
  };
}

function compareByCategoryOrder(categoryOrderIndex: OrderIndex): EntryComparator {
  return (a, b) => compareByOrder(a.category, b.category, categoryOrderIndex);
}

function compareByUltimateOrder(ultimateOrderIndex: OrderIndex): EntryComparator {
  return (a, b) => compareByOrder(a.encounter, b.encounter, ultimateOrderIndex);
}

function compareByCriterionOrder(criterionOrderIndex: OrderIndex): EntryComparator {
  return (a, b) => compareByOrder(a.encounter, b.encounter, criterionOrderIndex);
}

function compareByRoleOrder(a: BisEntry, b: BisEntry): number {
  const aIndex = ROLE_ORDER_INDEX.get(a.role) ?? Number.MAX_SAFE_INTEGER;
  const bIndex = ROLE_ORDER_INDEX.get(b.role) ?? Number.MAX_SAFE_INTEGER;
  if (aIndex !== bIndex) {
    return aIndex - bIndex;
  }
  return 0;
}

function buildComparator(
  filters: BisFiltersState,
  indexes: {
    ultimateOrderIndex: OrderIndex;
    criterionOrderIndex: OrderIndex;
    categoryOrderIndex: OrderIndex;
    jobOrderIndex: OrderIndex;
  }
): EntryComparator {
  const byJobPickerOrder: EntryComparator = (a, b) => compareJobsByPickerOrder(a, b, indexes.jobOrderIndex);
  const byUltimateOrder = compareByUltimateOrder(indexes.ultimateOrderIndex);
  const byCriterionOrder = compareByCriterionOrder(indexes.criterionOrderIndex);
  const byCategoryOrder = compareByCategoryOrder(indexes.categoryOrderIndex);

  if (filters.category === "Ultimate") {
    return composeComparators(byJobPickerOrder, byUltimateOrder, compareSimDpsDesc);
  }

  if (filters.job !== "All") {
    return composeComparators(
      byCategoryOrder,
      (a, b) => {
        if (a.category !== b.category) {
          return 0;
        }
        if (a.category === "Ultimate") {
          return byUltimateOrder(a, b);
        }
        if (a.category === "Criterion") {
          return byCriterionOrder(a, b);
        }
        return 0;
      },
      compareSimDpsDesc,
      byJobPickerOrder
    );
  }

  return composeComparators(
    byJobPickerOrder,
    byCategoryOrder,
    (a, b) => {
      if (a.category !== b.category) {
        return 0;
      }
      if (a.category === "Ultimate") {
        return byUltimateOrder(a, b);
      }
      if (a.category === "Criterion") {
        return byCriterionOrder(a, b);
      }
      return 0;
    },
    compareSimDpsDesc,
    compareByRoleOrder,
    (a, b) => a.job.localeCompare(b.job)
  );
}

export function filterEntries(
  entries: BisEntry[],
  filters: BisFiltersState,
  sortContext: SortContext = {}
): BisEntry[] {
  const query = filters.query.trim().toLowerCase();
  const ultimateOrderIndex = buildOrderIndex(sortContext.ultimateOrder);
  const criterionOrderIndex = buildOrderIndex(sortContext.criterionOrder);
  const categoryOrderIndex = buildOrderIndex(sortContext.categoryOrder);
  const jobOrderIndex = buildOrderIndex(sortContext.jobOrder);

  const comparator = buildComparator(filters, {
    ultimateOrderIndex,
    criterionOrderIndex,
    categoryOrderIndex,
    jobOrderIndex
  });

  return entries
    .filter((entry) => {
      if (filters.role !== "All" && entry.role !== filters.role) {
        return false;
      }

      if (filters.category !== "All" && entry.category !== filters.category) {
        return false;
      }

      if (filters.job !== "All" && entry.job !== filters.job) {
        return false;
      }

      if (filters.ultimate !== "All" && entry.category === "Ultimate" && entry.encounter !== filters.ultimate) {
        return false;
      }

      if (filters.criterion !== "All" && entry.category === "Criterion" && entry.encounter !== filters.criterion) {
        return false;
      }

      if (filters.unreal !== "All" && entry.category === "Unreal" && entry.encounter !== filters.unreal) {
        return false;
      }

      if (!query) {
        return true;
      }

      const target =
        `${entry.job} ${entry.role} ${entry.category} ${entry.encounter ?? ""} ${entry.tier} ${entry.link.name} ${entry.source.name} ${entry.note?.text ?? ""}`.toLowerCase();
      return target.includes(query);
    })
    .sort(comparator);
}
