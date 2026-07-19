import { describe, expect, it } from "vitest";
import {
  CANVAS_SIZE_OPTIONS,
  CROP_ASPECT_OPTIONS,
  DEFAULT_PRODUCT_IMAGE_EDIT,
  getCropCanvasDimensions,
} from "@/lib/admin-product-bg";

describe("product image edit defaults (free canvas editor)", () => {
  it("starts with sensible studio defaults", () => {
    expect(DEFAULT_PRODUCT_IMAGE_EDIT.scale).toBe(1);
    expect(DEFAULT_PRODUCT_IMAGE_EDIT.padding).toBeGreaterThan(0);
    expect(DEFAULT_PRODUCT_IMAGE_EDIT.shadowEnabled).toBe(true);
    expect(DEFAULT_PRODUCT_IMAGE_EDIT.canvasSize).toBe(1200);
    expect(DEFAULT_PRODUCT_IMAGE_EDIT.cropAspect).toBe("1:1");
  });

  it("exposes free export sizes", () => {
    expect(CANVAS_SIZE_OPTIONS).toEqual([800, 1200, 1600]);
  });

  it("calculates crop frame dimensions", () => {
    expect(CROP_ASPECT_OPTIONS.map((x) => x.value)).toEqual([
      "1:1",
      "4:3",
      "3:4",
      "16:9",
    ]);
    expect(getCropCanvasDimensions(1200, "1:1")).toEqual({
      width: 1200,
      height: 1200,
    });
    expect(getCropCanvasDimensions(1200, "4:3")).toEqual({
      width: 1200,
      height: 900,
    });
    expect(getCropCanvasDimensions(1200, "3:4")).toEqual({
      width: 900,
      height: 1200,
    });
    expect(getCropCanvasDimensions(1600, "16:9")).toEqual({
      width: 1600,
      height: 900,
    });
  });
});
