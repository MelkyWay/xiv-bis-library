import { CATEGORY_ORDER as GENERATED_CATEGORY_ORDER, type Category } from "./categories.generated";

export const CATEGORY_ORDER: Category[] = [...GENERATED_CATEGORY_ORDER];
export const CATEGORY_OPTIONS: Array<"All" | Category> = ["All", ...CATEGORY_ORDER];
