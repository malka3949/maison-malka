import { describe, expect, it } from "vitest";
import {
  CANVAS_SIZE_OPTIONS,
  DEFAULT_PRODUCT_IMAGE_EDIT,
} from "@/lib/admin-product-bg";

describe("product image edit defaults (free canvas editor)", () => {
  it("starts with sensible studio defaults", () => {
    expect(DEFAULT_PRODUCT_IMAGE_EDIT.scale).toBe(1);
    expect(DEFAULT_PRODUCT_IMAGE_EDIT.padding).toBeGreaterThan(0);
    expect(DEFAULT_PRODUCT_IMAGE_EDIT.shadowEnabled).toBe(true);
    expect(DEFAULT_PRODUCT_IMAGE_EDIT.canvasSize).toBe(1200);
  });

  it("exposes free square export sizes only", () => {
    expect(CANVAS_SIZE_OPTIONS).toEqual([800, 1200, 1600]);
  });
});
