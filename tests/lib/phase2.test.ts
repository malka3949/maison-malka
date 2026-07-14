import { describe, expect, it } from "vitest";
import { computeLineTotal, computeUnitPrice, roundMoney, sumMoney } from "@/lib/pricing";
import {
  isSaturday,
  minFulfillmentDate,
  startOfDay,
  validateFulfillmentDate,
} from "@/lib/fulfillment";
import { isLocale, localeDir } from "@/lib/i18n";

describe("pricing", () => {
  it("computes unit price with option deltas", () => {
    expect(computeUnitPrice(100, [10, 5])).toBe(115);
    expect(computeUnitPrice(100, [])).toBe(100);
  });

  it("computes line totals and sums", () => {
    expect(computeLineTotal(50, 3)).toBe(150);
    expect(sumMoney([10.555, 20.444])).toBe(roundMoney(30.999));
  });
});

describe("fulfillment validation", () => {
  it("rejects dates sooner than 2 days", () => {
    const today = new Date(2026, 6, 14); // Tue Jul 14 2026
    const tomorrow = new Date(2026, 6, 15);
    const result = validateFulfillmentDate(tomorrow, today);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("lead_time");
    }
  });

  it("rejects Saturdays even when lead time ok", () => {
    const today = new Date(2026, 6, 14); // Tuesday
    const saturday = new Date(2026, 6, 18); // Saturday
    expect(isSaturday(saturday)).toBe(true);
    const result = validateFulfillmentDate(saturday, today);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("saturday");
    }
  });

  it("accepts valid weekday after lead time", () => {
    const today = new Date(2026, 6, 14);
    const thursday = new Date(2026, 6, 16);
    expect(validateFulfillmentDate(thursday, today)).toEqual({ ok: true });
    expect(startOfDay(minFulfillmentDate(today)).getDate()).toBe(16);
  });
});

describe("locale helpers", () => {
  it("validates locales and directions", () => {
    expect(isLocale("he")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(localeDir("he")).toBe("rtl");
    expect(localeDir("en")).toBe("ltr");
  });
});
