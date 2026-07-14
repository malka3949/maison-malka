"use server";

import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  sendOrderApproved,
  sendOrderRejected,
} from "@/lib/notifications/resend";
import { prisma } from "@/lib/prisma";
import { assertTransition } from "@/lib/orders/status";

export type UpdateOrderStatusResult =
  | { ok: true; emailMessageId?: string; emailSkipped?: boolean }
  | { ok: false; error: string };

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
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

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus },
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

export async function rejectOrderFormAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  await updateOrderStatus(id, OrderStatus.rejected);
}
