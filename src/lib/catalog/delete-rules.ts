/** Pure catalog delete guards — unit-tested without Prisma. */

export type CategoryDeleteInput = {
  productCount: number;
  targetCategoryId: string | null | undefined;
  sourceCategoryId: string;
  targetExists: boolean;
};

export type CategoryDeleteDecision =
  | { ok: true; mode: "empty" }
  | { ok: true; mode: "reassign"; targetCategoryId: string }
  | { ok: false; error: string };

export function decideCategoryDelete(input: CategoryDeleteInput): CategoryDeleteDecision {
  if (input.productCount <= 0) {
    return { ok: true, mode: "empty" };
  }

  const target = String(input.targetCategoryId ?? "").trim();
  if (!target) {
    return {
      ok: false,
      error: "יש מוצרים בקטגוריה — בחרו קטגוריית יעד להעברה לפני המחיקה",
    };
  }
  if (target === input.sourceCategoryId) {
    return {
      ok: false,
      error: "קטגוריית היעד חייבת להיות שונה מהקטגוריה שנמחקת",
    };
  }
  if (!input.targetExists) {
    return { ok: false, error: "קטגוריית היעד לא נמצאה" };
  }

  return { ok: true, mode: "reassign", targetCategoryId: target };
}

export type ProductDeleteInput = {
  orderItemCount: number;
  bundleMembershipCount: number;
};

export type ProductDeleteDecision =
  | { ok: true }
  | { ok: false; error: string };

export function decideProductDelete(input: ProductDeleteInput): ProductDeleteDecision {
  if (input.orderItemCount > 0) {
    return {
      ok: false,
      error: "לא ניתן למחוק מוצר שמופיע בהזמנות — הסתירו אותו (לא זמין) במקום",
    };
  }
  if (input.bundleMembershipCount > 0) {
    return {
      ok: false,
      error: "לא ניתן למחוק מוצר שכלול במארז — הסירו אותו מהמארז או הסתירו אותו",
    };
  }
  return { ok: true };
}
