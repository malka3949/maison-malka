import Link from "next/link";
import { OrderStatus } from "@prisma/client";
import { adminUi } from "@/lib/admin-ui";
import { orderStatusLabelHe } from "@/lib/orders/status";

const statuses: Array<{ value: string; label: string }> = [
  { value: "", label: "הכל" },
  { value: OrderStatus.pending_approval, label: orderStatusLabelHe.pending_approval },
  { value: OrderStatus.approved, label: orderStatusLabelHe.approved },
  { value: OrderStatus.rejected, label: orderStatusLabelHe.rejected },
];

export function OrderFilters({
  status,
  from,
  to,
}: {
  status?: string;
  from?: string;
  to?: string;
}) {
  return (
    <form
      method="get"
      action="/admin/orders"
      className="flex flex-wrap items-end gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-sm"
    >
      <label className="flex flex-col gap-1 text-sm">
        <span className={adminUi.muted}>סטטוס</span>
        <select name="status" defaultValue={status ?? ""} className={adminUi.select}>
          {statuses.map((s) => (
            <option key={s.value || "all"} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className={adminUi.muted}>מתאריך יצירה</span>
        <input type="date" name="from" defaultValue={from ?? ""} className={adminUi.inputSm} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className={adminUi.muted}>עד תאריך יצירה</span>
        <input type="date" name="to" defaultValue={to ?? ""} className={adminUi.inputSm} />
      </label>
      <button type="submit" className={adminUi.btnPrimary}>
        סינון
      </button>
      <Link href="/admin/orders" className={adminUi.btnSecondary}>
        נקה
      </Link>
    </form>
  );
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const label = orderStatusLabelHe[status];
  const className =
    status === OrderStatus.pending_approval
      ? "rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-900"
      : status === OrderStatus.approved
        ? adminUi.badgeOn
        : status === OrderStatus.rejected
          ? "rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-800"
          : adminUi.badgeOff;

  return <span className={className}>{label}</span>;
}
