import { describe, expect, it } from "vitest";
import {
  getRejectionReasonText,
  validateRejectionReason,
} from "@/lib/orders/rejection-reasons";
import { buildOrderRejectedEmail } from "@/lib/notifications/templates";

describe("order rejection reasons", () => {
  it("accepts a preset reason and localizes it for the customer", () => {
    expect(validateRejectionReason("availability", "")).toEqual({
      ok: true,
      code: "availability",
      custom: null,
    });
    expect(getRejectionReasonText("availability", null, "he")).toBe(
      "אין זמינות לתאריך המבוקש",
    );
    expect(getRejectionReasonText("availability", null, "en")).toBe(
      "There is no availability for the requested date",
    );
  });

  it("requires custom text for another reason", () => {
    expect(validateRejectionReason("other", "  ")).toEqual({
      ok: false,
      error: "custom_reason_required",
    });
    expect(validateRejectionReason("other", "  Custom explanation  ")).toEqual({
      ok: true,
      code: "other",
      custom: "Custom explanation",
    });
  });

  it("rejects unknown and oversized reasons", () => {
    expect(validateRejectionReason("unknown", "")).toEqual({
      ok: false,
      error: "invalid_reason",
    });
    expect(validateRejectionReason("other", "a".repeat(501))).toEqual({
      ok: false,
      error: "custom_reason_too_long",
    });
  });

  it("includes and escapes the reason in the rejection email", () => {
    const email = buildOrderRejectedEmail({
      orderId: "order_12345678",
      customerName: "Dana",
      customerEmail: "dana@example.com",
      fulfillmentDate: "2026-08-01",
      total: "120",
      locale: "en",
      rejectionReason: "<b>Unavailable</b>",
    });

    expect(email.html).toContain("Reason");
    expect(email.html).toContain("&lt;b&gt;Unavailable&lt;/b&gt;");
    expect(email.html).not.toContain("<b>Unavailable</b>");
  });
});
