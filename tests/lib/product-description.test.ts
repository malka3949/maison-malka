import { describe, expect, it } from "vitest";
import {
  suggestProductDescriptions,
  translateProductNameToEnglish,
} from "@/lib/ai/product-description";

describe("translateProductNameToEnglish", () => {
  it("translates common bakery product names", () => {
    expect(translateProductNameToEnglish("עוגת שוקולד")).toBe("Chocolate cake");
    expect(translateProductNameToEnglish("מארז מתנה")).toBe("Gift box");
    expect(translateProductNameToEnglish("עוגיות שמש")).toBe("Sun cookies");
  });

  it("combines known ingredients with a product type", () => {
    expect(translateProductNameToEnglish("עוגת פיסטוק")).toBe("Pistachio cake");
    expect(translateProductNameToEnglish("קינוח לוטוס")).toBe(
      "Lotus dessert",
    );
    expect(translateProductNameToEnglish("עוגיות חמאה")).toBe("Butter cookies");
  });

  it("returns empty for empty or unknown names instead of letter soup", () => {
    expect(translateProductNameToEnglish("  ")).toBe("");
    expect(translateProductNameToEnglish("ממתק זר לא מוכר")).toBe("");
    expect(translateProductNameToEnglish("עוגת קסם-לא-קיים")).toBe("");
  });

  it("does not leave mixed Hebrew leftovers for partial pattern matches", () => {
    expect(translateProductNameToEnglish("עוגיות כוכב")).toBe("Star Cookies");
    expect(translateProductNameToEnglish("חלה מתוקה")).toBe("Sweet challah");
  });
});

describe("suggestProductDescriptions", () => {
  it("builds HE/EN cake copy from names and category", () => {
    const result = suggestProductDescriptions({
      nameHe: "עוגת מספר",
      nameEn: "Number cake",
      categoryLabel: "עוגות",
      productType: "standard",
    });

    expect(result.source).toBe("local");
    expect(result.he).toContain("עוגת מספר");
    expect(result.he).toContain("Maison Malka");
    expect(result.en).toContain("Number cake");
    expect(result.en).toMatch(/cake|boutique/i);
  });

  it("uses bundle wording for gift boxes", () => {
    const result = suggestProductDescriptions({
      nameHe: "מארז חגיגי",
      nameEn: "Celebration box",
      categoryLabel: "מארזים",
      productType: "bundle",
    });

    expect(result.he).toContain("מארז");
    expect(result.en.toLowerCase()).toContain("gift box");
  });

  it("falls back when names are empty", () => {
    const result = suggestProductDescriptions({
      nameHe: "  ",
      nameEn: "",
      productType: "standard",
    });

    expect(result.he.length).toBeGreaterThan(20);
    expect(result.en.length).toBeGreaterThan(20);
  });
});
