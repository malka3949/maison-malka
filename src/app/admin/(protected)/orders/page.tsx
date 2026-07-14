import Link from "next/link";
import { OrderStatus, Prisma } from "@prisma/client";
import { OrderFilters, OrderStatusBadge } from "@/components/admin/OrderFilters";
import { prisma } from "@/lib/prisma";
import { adminUi } from "@/lib/admin-ui";
import { orderStatusLabelHe } from "@/lib/orders/status";

export const dynamic = "force-dynamic";

function parseStatus(value?: string): OrderStatus | undefined {
  if (!value) return undefined;
  if (Object.values(OrderStatus).includes(value as OrderStatus)) {
    return value as OrderStatus;
  }
  return undefined;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; from?: string; to?: string }>;
}) {
  const { status: statusParam, from, to } = await searchParams;
  const status = parseStatus(statusParam);

  const where: Prisma.OrderWhereInput = {};
  if (status) {
    where.status = status;
  }
  if (from || to) {
    where.created_at = {};
    if (from) {
      where.created_at.gte = new Date(from + "T00:00:00");
    }
    if (to) {
      where.created_at.lte = new Date(to + "T23:59:59.999");
    }
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { created_at: "desc" },
    include: {
      _count: { select: { items: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className={adminUi.h1}>הזמנות</h1>
        <div className="flex gap-2">
          <Link href="/admin/orders/calendar" className={adminUi.btnSecondary}>
            לוח שנה
          </Link>
        </div>
      </div>

      <OrderFilters status={statusParam} from={from} to={to} />

      <div className={adminUi.table}>
        <table className="min-w-full text-sm">
          <thead className={adminUi.tableHead}>
            <tr>
              <th className="px-4 py-3 text-right font-medium">תאריך יצירה</th>
              <th className="px-4 py-3 text-right font-medium">לקוח</th>
              <th className="px-4 py-3 text-right font-medium">מילוי מבוקש</th>
              <th className="px-4 py-3 text-right font-medium">סטטוס</th>
              <th className="px-4 py-3 text-right font-medium">פריטים</th>
              <th className="px-4 py-3 text-right font-medium">סכום</th>
              <th className="px-4 py-3 text-right font-medium">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className={adminUi.tableRow}>
                <td className="px-4 py-3">
                  {order.created_at.toLocaleDateString("he-IL")}
                </td>
                <td className="px-4 py-3">{order.customer_name}</td>
                <td className="px-4 py-3">
                  {order.requested_fulfillment_date.toLocaleDateString("he-IL")}
                </td>
                <td className="px-4 py-3">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3">{order._count.items}</td>
                <td className={`px-4 py-3 ${adminUi.price}`}>₪{order.total.toString()}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`} className={adminUi.link}>
                    פרטים
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 ? (
          <p className={`px-4 py-8 text-center ${adminUi.muted}`}>אין הזמנות להצגה</p>
        ) : null}
      </div>

      <p className={`text-xs ${adminUi.muted}`}>
        סטטוסים: {Object.values(OrderStatus).map((s) => orderStatusLabelHe[s]).join(" · ")}
      </p>
    </div>
  );
}
