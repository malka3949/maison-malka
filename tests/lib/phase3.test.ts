import { afterEach, describe, expect, it } from "vitest";
import { OrderStatus } from "@prisma/client";
import {
  formatDateKey,
  groupOrdersByFulfillmentDate,
} from "@/lib/orders/calendar";
import {
  assertTransition,
  canTransition,
} from "@/lib/orders/status";
import { resolveEmailDestination } from "@/lib/notifications/resend";
import {
  buildOrderAdminNewEmail,
  buildOrderApprovedEmail,
  buildOrderReceivedEmail,
  toAdminNewOrderEmailPayload,
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

describe("RESEND_DEV_TO redirect", () => {
  const prev = process.env.RESEND_DEV_TO;

  afterEach(() => {
    if (prev === undefined) {
      delete process.env.RESEND_DEV_TO;
    } else {
      process.env.RESEND_DEV_TO = prev;
    }
  });

  it("sends to intended recipient when override unset", () => {
    delete process.env.RESEND_DEV_TO;
    const dest = resolveEmailDestination("customer@example.com");
    expect(dest.to).toBe("customer@example.com");
    expect(dest.subjectPrefix).toBe("");
  });

  it("redirects all mail to RESEND_DEV_TO when set", () => {
    process.env.RESEND_DEV_TO = "owner@example.com";
    const dest = resolveEmailDestination("customer@example.com");
    expect(dest.to).toBe("owner@example.com");
    expect(dest.subjectPrefix).toContain("customer@example.com");
    expect(dest.htmlNote).toContain("customer@example.com");
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

  it("builds English order received email when locale is en", () => {
    const payload = toOrderEmailPayload({
      id: "order_en",
      customer_name: "Alex",
      customer_email: "alex@example.com",
      requested_fulfillment_date: new Date("2026-08-01T00:00:00Z"),
      total: "90",
      locale: "en",
    });
    const email = buildOrderReceivedEmail(payload);
    expect(email.subject).toContain("Order received");
    expect(email.html).toContain("lang=\"en\"");
    expect(email.html).toContain("Hello");
    expect(email.html).not.toContain("ההזמנה התקבלה");
  });

  it("builds admin new-order alert email", () => {
    const payload = toAdminNewOrderEmailPayload(
      {
        id: "order_456",
        customer_name: "דנה",
        customer_email: "dana@example.com",
        customer_phone: "050-1234567",
        fulfillment_type: "delivery",
        delivery_address: "רחוב הרצל 1",
        payment_method: "bank_transfer",
        customer_notes: null,
        requested_fulfillment_date: new Date("2026-08-01T00:00:00Z"),
        total: "200",
      },
      3,
    );
    const email = buildOrderAdminNewEmail(payload);
    expect(email.subject).toContain("הזמנה חדשה");
    expect(email.html).toContain("order_456");
    expect(email.html).toContain("050-1234567");
    expect(email.html).toContain("רחוב הרצל 1");
    expect(email.html).toContain("3");
    expect(payload.adminOrderUrl).toContain("/admin/orders/order_456");
    expect(email.html).toContain("לאישור ההזמנה באתר");
    expect(email.html).toContain(payload.adminOrderUrl);
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
