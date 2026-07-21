"use server";

import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { writeAccessAudit } from "@/lib/access-audit";
import { requireAdmin } from "@/lib/auth";
import {
  sendOrderApproved,
  sendOrderCompleted,
  sendOrderRejected,
} from "@/lib/notifications/resend";
import { prisma } from "@/lib/prisma";
import { assertTransition } from "@/lib/orders/status";
import {
  validateRejectionReason,
  type RejectionReasonCode,
} from "@/lib/orders/rejection-reasons";

export type UpdateOrderStatusResult =
  | { ok: true; emailMessageId?: string; emailSkipped?: boolean }
  | { ok: false; error: string };

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  rejectionReason?: {
    code: RejectionReasonCode;
    custom: string | null;
  },
): Promise<UpdateOrderStatusResult> {
  const admin = await requireAdmin();
  if (!admin) {
    await writeAccessAudit({
      action: "order.status_update",
      resource: `order:${orderId}`,
      detail: newStatus,
      success: false,
    });
    return { ok: false, error: "unauthorized" };
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return { ok: false, error: "not_found" };
  }

  const check = assertTransition(order.status, newStatus);
  if (!check.ok) {
    return { ok: false, error: check.error };
  }
  if (newStatus === OrderStatus.rejected && !rejectionReason) {
    return { ok: false, error: "rejection_reason_required" };
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: newStatus,
      rejection_reason_code:
        newStatus === OrderStatus.rejected ? rejectionReason!.code : null,
      rejection_reason_custom:
        newStatus === OrderStatus.rejected ? rejectionReason!.custom : null,
    },
  });

  await writeAccessAudit({
    actorId: admin.appUser.id,
    actorEmail: admin.appUser.email,
    action: "order.status_update",
    resource: `order:${orderId}`,
    detail: `${order.status}->${newStatus}`,
  });

  let emailMessageId: string | undefined;
  let emailSkipped = false;

  if (newStatus === OrderStatus.approved) {
    const email = await sendOrderApproved(updated);
    if (email.ok) {
      emailMessageId = email.messageId;
    } else if (email.skipped) {
      emailSkipped = true;
    } else {
      console.error("[admin-orders] approval email failed", email.error);
    }
  } else if (newStatus === OrderStatus.rejected) {
    const email = await sendOrderRejected(updated);
    if (email.ok) {
      emailMessageId = email.messageId;
    } else if (email.skipped) {
      emailSkipped = true;
    } else {
      console.error("[admin-orders] rejection email failed", email.error);
    }
  } else if (newStatus === OrderStatus.completed) {
    const email = await sendOrderCompleted(updated);
    if (email.ok) {
      emailMessageId = email.messageId;
    } else if (email.skipped) {
      emailSkipped = true;
    } else {
      console.error("[admin-orders] completed email failed", email.error);
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders/calendar");

  return { ok: true, emailMessageId, emailSkipped };
}

export async function approveOrderFormAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  await updateOrderStatus(id, OrderStatus.approved);
}

export type RejectionFormState = {
  error?: string;
};

export async function rejectOrderFormAction(
  _previous: RejectionFormState,
  formData: FormData,
): Promise<RejectionFormState> {
  const id = String(formData.get("id") || "");
  const validated = validateRejectionReason(
    String(formData.get("reasonCode") || ""),
    String(formData.get("customReason") || ""),
  );
  if (!validated.ok) {
    const message =
      validated.error === "custom_reason_required"
        ? "יש לכתוב סיבה כאשר בוחרים „סיבה אחרת”."
        : validated.error === "custom_reason_too_long"
          ? "הסיבה ארוכה מדי (מקסימום 500 תווים)."
          : "יש לבחור סיבת דחייה.";
    return { error: message };
  }
  const result = await updateOrderStatus(id, OrderStatus.rejected, {
    code: validated.code,
    custom: validated.custom,
  });
  return result.ok ? {} : { error: "דחיית ההזמנה נכשלה. נסו שוב." };
}

export async function completeOrderFormAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  await updateOrderStatus(id, OrderStatus.completed);
}

/** Privacy: anonymize customer PII on an order (admin DSAR/erasure support). */
export async function anonymizeOrderPiiAction(
  orderId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) {
    await writeAccessAudit({
      action: "order.anonymize_pii",
      resource: `order:${orderId}`,
      success: false,
    });
    return { ok: false, error: "unauthorized" };
  }
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return { ok: false, error: "not_found" };
  }
  await prisma.order.update({
    where: { id: orderId },
    data: {
      customer_name: "[נמחק]",
      customer_phone: "0000000000",
      customer_email: `deleted-${orderId.slice(0, 8)}@invalid.local`,
      delivery_address: null,
      customer_notes: null,
    },
  });
  await writeAccessAudit({
    actorId: admin.appUser.id,
    actorEmail: admin.appUser.email,
    action: "order.anonymize_pii",
    resource: `order:${orderId}`,
  });
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { ok: true };
}

/** Privacy: export order personal data JSON for admin-assisted access requests. */
export async function exportOrderPiiAction(
  orderId: string,
): Promise<{ ok: true; data: unknown } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) {
    await writeAccessAudit({
      action: "order.export_pii",
      resource: `order:${orderId}`,
      success: false,
    });
    return { ok: false, error: "unauthorized" };
  }
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          options: true,
          product: { include: { translations: true } },
        },
      },
    },
  });
  if (!order) {
    return { ok: false, error: "not_found" };
  }
  await writeAccessAudit({
    actorId: admin.appUser.id,
    actorEmail: admin.appUser.email,
    action: "order.export_pii",
    resource: `order:${orderId}`,
  });
  return {
    ok: true,
    data: {
      exported_at: new Date().toISOString(),
      order_id: order.id,
      status: order.status,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      customer_email: order.customer_email,
      delivery_address: order.delivery_address,
      customer_notes: order.customer_notes,
      locale: order.locale,
      fulfillment_type: order.fulfillment_type,
      requested_fulfillment_date: order.requested_fulfillment_date,
      payment_method: order.payment_method,
      totals: { subtotal: order.subtotal, total: order.total },
      items: order.items.map((item) => ({
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: item.line_total,
        product_names: item.product.translations.map((t) => ({
          locale: t.locale,
          name: t.name,
        })),
        options: item.options.map((o) => ({
          name: o.option_name_snapshot,
          value: o.option_value_snapshot,
        })),
      })),
    },
  };
}
