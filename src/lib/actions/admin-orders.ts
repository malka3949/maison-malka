"use server";

import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
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
