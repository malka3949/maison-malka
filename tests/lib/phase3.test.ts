import { describe, expect, it } from "vitest";
import { OrderStatus } from "@prisma/client";
import {
  formatDateKey,
  groupOrdersByFulfillmentDate,
} from "@/lib/orders/calendar";
import {
  assertTransition,
  canTransition,
} from "@/lib/orders/status";
import {
  buildOrderApprovedEmail,
  buildOrderReceivedEmail,
  toOrderEmailPayload,
} from "@/lib/notifications/templates";

describe("order status transitions", () => {
  it("allows approve and reject from pending_approval", () => {
    expect(
      canTransition(OrderStatus.pending_approval, OrderStatus.approved),
    ).toBe(true);
    expect(
      canTransition(OrderStatus.pending_approval, OrderStatus.rejected),
    ).toBe(true);
  });

  it("rejects illegal transitions", () => {
    expect(canTransition(OrderStatus.approved, OrderStatus.rejected)).toBe(false);
    expect(canTransition(OrderStatus.rejected, OrderStatus.approved)).toBe(false);
    expect(assertTransition(OrderStatus.approved, OrderStatus.rejected)).toEqual({
      ok: false,
      error: "invalid_transition",
    });
  });

  it("rejects same status", () => {
    expect(assertTransition(OrderStatus.pending_approval, OrderStatus.pending_approval)).toEqual({
      ok: false,
      error: "same_status",
    });
  });
});

describe("calendar grouping", () => {
  it("groups orders by fulfillment date key", () => {
    const orders = [
      {
        id: "a",
        customer_name: "Alice",
        status: "pending_approval",
        total: 100,
        requested_fulfillment_date: new Date("2026-07-20T00:00:00Z"),
      },
      {
        id: "b",
        customer_name: "Bob",
        status: "approved",
        total: 50,
        requested_fulfillment_date: new Date("2026-07-20T12:00:00Z"),
      },
      {
        id: "c",
        customer_name: "Carol",
        status: "pending_approval",
        total: 75,
        requested_fulfillment_date: new Date("2026-07-21T00:00:00Z"),
      },
    ];

    expect(formatDateKey(orders[0].requested_fulfillment_date)).toBe("2026-07-20");
    const grouped = groupOrdersByFulfillmentDate(orders);
    expect(grouped.get("2026-07-20")?.map((o) => o.id).sort()).toEqual(["a", "b"]);
    expect(grouped.get("2026-07-21")?.map((o) => o.id)).toEqual(["c"]);
  });
});

describe("notification templates", () => {
  it("builds order received payload and email", () => {
    const payload = toOrderEmailPayload({
      id: "order_123",
      customer_name: "Test User",
      customer_email: "test@example.com",
      requested_fulfillment_date: new Date("2026-08-01T00:00:00Z"),
      total: "150.00",
    });
    expect(payload.customerEmail).toBe("test@example.com");
    const email = buildOrderReceivedEmail(payload);
    expect(email.subject).toContain("התקבלה");
    expect(email.html).toContain("order_123");
    expect(email.html).toContain("Test User");
  });

  it("escapes html in approved template", () => {
    const payload = toOrderEmailPayload({
      id: "x",
      customer_name: "<script>",
      customer_email: "a@b.com",
      requested_fulfillment_date: new Date("2026-08-01T00:00:00Z"),
      total: "10",
    });
    const email = buildOrderApprovedEmail(payload);
    expect(email.html).not.toContain("<script>");
    expect(email.html).toContain("&lt;script&gt;");
  });
});
