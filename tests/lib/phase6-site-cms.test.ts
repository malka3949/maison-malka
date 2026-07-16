import { describe, expect, it } from "vitest";
import {
  assertAllowedTextKey,
  joinTickerItems,
  mergeMessagesWithCms,
  mergeSettings,
  resolveHomeMediaSlots,
  splitTickerItems,
} from "@/lib/site-content";
import { he } from "@/messages/he";

describe("site content allowlist", () => {
  it("accepts known text keys", () => {
    expect(assertAllowedTextKey("hero.title")).toBe("hero.title");
  });

  it("rejects unknown text keys", () => {
    expect(() => assertAllowedTextKey("evil.script")).toThrow(/Unknown/);
  });
});

describe("ticker newline format", () => {
  it("joins and splits items", () => {
    const joined = joinTickerItems([" a ", "b", "", "c"]);
    expect(joined).toBe("a\nb\nc");
    expect(splitTickerItems(joined)).toEqual(["a", "b", "c"]);
  });
});

describe("mergeMessagesWithCms", () => {
  it("falls back when block missing or blank", () => {
    const merged = mergeMessagesWithCms(he, {
      "hero.title": "  ",
      announcement: undefined,
    });
    expect(merged.heroTitle).toBe(he.heroTitle);
    expect(merged.announcement).toBe(he.announcement);
  });

  it("overrides when value present", () => {
    const merged = mergeMessagesWithCms(he, {
      "hero.title": "CMS Hero",
      ticker: "one\ntwo",
    });
    expect(merged.heroTitle).toBe("CMS Hero");
    expect(merged.tickerItems).toEqual(["one", "two"]);
  });
});

describe("resolveHomeMediaSlots", () => {
  it("uses CMS url when set else fallback", () => {
    const result = resolveHomeMediaSlots(
      {
        hero: "/placeholders/a.jpg",
        promoCatalog: "/placeholders/b.jpg",
        promoGift: "/placeholders/c.jpg",
      },
      {
        "hero.image": "/uploads/site-media/x.jpg",
        "promo.catalog.image": "",
      },
    );
    expect(result.hero).toBe("/uploads/site-media/x.jpg");
    expect(result.promoCatalog).toBe("/placeholders/b.jpg");
  });
});

describe("mergeSettings", () => {
  it("keeps allowlisted non-empty settings only", () => {
    const map = mergeSettings([
      { key: "phone", value: " 050 " },
      { key: "hack", value: "nope" },
      { key: "pickup_address", value: "" },
    ]);
    expect(map).toEqual({ phone: "050" });
  });
});
