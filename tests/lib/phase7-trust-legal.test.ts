import { describe, expect, it } from "vitest";
import { checkoutTrustGateError } from "@/lib/checkout-gates";
import {
  mergeSettings,
  resolveBusinessContact,
} from "@/lib/site-content";
import { buildOrderApprovedEmail } from "@/lib/notifications/templates";
import { he } from "@/messages/he";

describe("checkoutTrustGateError", () => {
  it("rejects missing terms", () => {
    expect(
      checkoutTrustGateError({
        acceptedTerms: false,
        fulfillmentType: "pickup",
      }),
    ).toBe("accepted_terms");
  });

  it("rejects delivery without area affirmation", () => {
    expect(
      checkoutTrustGateError({
        acceptedTerms: true,
        fulfillmentType: "delivery",
        deliveryAreaConfirmed: false,
      }),
    ).toBe("delivery_area");
  });

  it("passes pickup with terms", () => {
    expect(
      checkoutTrustGateError({
        acceptedTerms: true,
        fulfillmentType: "pickup",
      }),
    ).toBeNull();
  });

  it("passes delivery with affirmation", () => {
    expect(
      checkoutTrustGateError({
        acceptedTerms: true,
        fulfillmentType: "delivery",
        deliveryAreaConfirmed: true,
      }),
    ).toBeNull();
  });
});

describe("resolveBusinessContact", () => {
  it("uses CMS when set else message fallbacks", () => {
    expect(
      resolveBusinessContact({}, he),
    ).toEqual({
      phone: he.fallbackPhone,
      email: he.fallbackContactEmail,
      address: he.fallbackPickupAddress,
      hours: he.fallbackBusinessHours,
    });

    expect(
      resolveBusinessContact(
        {
          phone: "02-123",
          contact_email: "shop@example.com",
          pickup_address: "Addr",
          business_hours: "9-17",
        },
        he,
      ),
    ).toEqual({
      phone: "02-123",
      email: "shop@example.com",
      address: "Addr",
      hours: "9-17",
    });
  });
});

describe("bank_transfer_details settings key", () => {
  it("is allowlisted in mergeSettings", () => {
    const map = mergeSettings([
      { key: "bank_transfer_details", value: " Bank IL\nIBAN x " },
      { key: "unknown", value: "no" },
    ]);
    expect(map.bank_transfer_details).toBe("Bank IL\nIBAN x");
    expect(map).not.toHaveProperty("unknown");
  });
});

describe("buildOrderApprovedEmail bank instructions", () => {
  const base = {
    orderId: "ord-12345678",
    customerName: "Dana",
    customerEmail: "dana@example.com",
    fulfillmentDate: "2026-08-01",
    total: "120",
    locale: "he" as const,
  };

  it("includes bank details when provided", () => {
    const email = buildOrderApprovedEmail({
      ...base,
      paymentMethod: "bank_transfer",
      bankTransferDetails: "Bank Hapoalim\nAccount 123",
    });
    expect(email.html).toContain("הוראות להעברה בנקאית");
    expect(email.html).toContain("Bank Hapoalim");
  });

  it("falls back to phone when details missing", () => {
    const email = buildOrderApprovedEmail({
      ...base,
      paymentMethod: "bank_transfer",
      bankTransferDetails: null,
      contactPhone: "050-111-2222",
    });
    expect(email.html).toContain("050-111-2222");
  });

  it("omits bank block for on_pickup", () => {
    const email = buildOrderApprovedEmail({
      ...base,
      paymentMethod: "on_pickup",
      bankTransferDetails: "should-not-show",
    });
    expect(email.html).not.toContain("should-not-show");
    expect(email.html).not.toContain("הוראות להעברה בנקאית");
  });
});
