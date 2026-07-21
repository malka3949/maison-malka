import { describe, expect, it } from "vitest";
import {
  decideCategoryDelete,
  decideProductDelete,
} from "@/lib/catalog/delete-rules";

describe("decideCategoryDelete", () => {
  it("allows deleting an empty category", () => {
    expect(
      decideCategoryDelete({
        productCount: 0,
        targetCategoryId: null,
        sourceCategoryId: "cat-a",
        targetExists: false,
      }),
    ).toEqual({ ok: true, mode: "empty" });
  });

  it("rejects a non-empty category without a target", () => {
    expect(
      decideCategoryDelete({
        productCount: 3,
        targetCategoryId: null,
        sourceCategoryId: "cat-a",
        targetExists: false,
      }),
    ).toEqual({
      ok: false,
      error: "יש מוצרים בקטגוריה — בחרו קטגוריית יעד להעברה לפני המחיקה",
    });
  });

  it("rejects when target equals source", () => {
    expect(
      decideCategoryDelete({
        productCount: 2,
        targetCategoryId: "cat-a",
        sourceCategoryId: "cat-a",
        targetExists: true,
      }).ok,
    ).toBe(false);
  });

  it("rejects when target does not exist", () => {
    expect(
      decideCategoryDelete({
        productCount: 2,
        targetCategoryId: "missing",
        sourceCategoryId: "cat-a",
        targetExists: false,
      }),
    ).toEqual({ ok: false, error: "קטגוריית היעד לא נמצאה" });
  });

  it("allows reassign then delete when target is valid", () => {
    expect(
      decideCategoryDelete({
        productCount: 2,
        targetCategoryId: "cat-b",
        sourceCategoryId: "cat-a",
        targetExists: true,
      }),
    ).toEqual({ ok: true, mode: "reassign", targetCategoryId: "cat-b" });
  });
});

describe("decideProductDelete", () => {
  it("allows deleting a clean product", () => {
    expect(
      decideProductDelete({ orderItemCount: 0, bundleMembershipCount: 0 }),
    ).toEqual({ ok: true });
  });

  it("blocks products that appear on orders", () => {
    const result = decideProductDelete({
      orderItemCount: 1,
      bundleMembershipCount: 0,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("הזמנות");
    }
  });

  it("blocks products used inside bundles", () => {
    const result = decideProductDelete({
      orderItemCount: 0,
      bundleMembershipCount: 2,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("מארז");
    }
  });
});
