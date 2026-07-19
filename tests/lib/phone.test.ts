import { describe, expect, it } from "vitest";
import {
  isValidIsraeliMobile,
  normalizeIsraeliMobile,
} from "@/lib/validation/phone";

describe("normalizeIsraeliMobile", () => {
  it("accepts common local formats", () => {
    expect(normalizeIsraeliMobile("0501234567")).toBe("0501234567");
    expect(normalizeIsraeliMobile("050-123-4567")).toBe("0501234567");
    expect(normalizeIsraeliMobile("050 123 4567")).toBe("0501234567");
  });

  it("accepts +972 mobile", () => {
    expect(normalizeIsraeliMobile("+972501234567")).toBe("0501234567");
    expect(normalizeIsraeliMobile("972501234567")).toBe("0501234567");
  });

  it("rejects invalid numbers", () => {
    expect(normalizeIsraeliMobile("")).toBeNull();
    expect(normalizeIsraeliMobile("123")).toBeNull();
    expect(normalizeIsraeliMobile("0401234567")).toBeNull();
    expect(normalizeIsraeliMobile("050123456")).toBeNull();
    expect(isValidIsraeliMobile("not-a-phone")).toBe(false);
  });
});
