import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { adminUi } from "@/lib/admin-ui";
import {
  groupOrdersByFulfillmentDate,
  sortedDateKeys,
} from "@/lib/orders/calendar";
import { OrderStatusBadge } from "@/components/admin/OrderFilters";

export const dynamic = "force-dynamic";

export default async function AdminOrdersCalendarPage() {
  const orders = await prisma.order.findMany({
    orderBy: { requested_fulfillment_date: "asc" },
    select: {
      id: true,
      customer_name: true,
      status: true,
      total: true,
      requested_fulfillment_date: true,
    },
  });

  const grouped = groupOrdersByFulfillmentDate(orders);
  const dates = sortedDateKeys(grouped);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className={adminUi.h1}>לוח שנה — הזמנות</h1>
        <Link href="/admin/orders" className={adminUi.btnSecondary}>
          רשימת הזמנות
        </Link>
      </div>

      <p className={`text-sm ${adminUi.muted}`}>
        הזמנות מקובצות לפי תאריך מילוי מבוקש.
      </p>

      {dates.length === 0 ? (
        <p className={adminUi.muted}>אין הזמנות להצגה.</p>
      ) : (
        <div className="space-y-4">
          {dates.map((dateKey) => {
            const dayOrders = grouped.get(dateKey) ?? [];
            const displayDate = new Date(dateKey + "T12:00:00").toLocaleDateString("he-IL", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            });
            return (
              <section key={dateKey} className={adminUi.section}>
                <div className="flex items-center justify-between gap-4">
                  <h2 className={adminUi.h2}>{displayDate}</h2>
                  <span className={`text-sm ${adminUi.muted}`}>
                    {dayOrders.length} הזמנות
                  </span>
                </div>
                <ul className="mt-4 space-y-2">
                  {dayOrders.map((order) => (
                    <li
                      key={order.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-stone-100 px-3 py-2"
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <Link href={`/admin/orders/${order.id}`} className={adminUi.link}>
                          {order.customer_name}
                        </Link>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <span className={adminUi.price}>₪{order.total.toString()}</span>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
