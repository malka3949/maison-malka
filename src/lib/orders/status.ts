import { OrderStatus } from "@prisma/client";

const ADMIN_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  [OrderStatus.pending_approval]: [
    OrderStatus.approved,
    OrderStatus.rejected,
  ],
  [OrderStatus.approved]: [OrderStatus.completed],
  [OrderStatus.payment_pending]: [OrderStatus.completed],
};

export function canTransition(
  from: OrderStatus,
  to: OrderStatus,
): boolean {
  const allowed = ADMIN_TRANSITIONS[from];
  return allowed?.includes(to) ?? false;
}

export function assertTransition(
  from: OrderStatus,
  to: OrderStatus,
): { ok: true } | { ok: false; error: string } {
  if (from === to) {
    return { ok: false, error: "same_status" };
  }
  if (!canTransition(from, to)) {
    return { ok: false, error: "invalid_transition" };
  }
  return { ok: true };
}

export const orderStatusLabelHe: Record<OrderStatus, string> = {
  pending_approval: "ממתין לאישור",
  approved: "מאושר",
  rejected: "נדחה",
  payment_pending: "ממתין לתשלום",
  completed: "הושלם",
};

export const orderStatusLabelEn: Record<OrderStatus, string> = {
  pending_approval: "Pending approval",
  approved: "Approved",
  rejected: "Rejected",
  payment_pending: "Payment pending",
  completed: "Completed",
};

export function orderStatusLabel(
  status: OrderStatus,
  locale: "he" | "en",
): string {
  return locale === "en"
    ? orderStatusLabelEn[status]
    : orderStatusLabelHe[status];
}
