import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderApproveRejectActions } from "@/components/admin/OrderApproveRejectActions";
import { OrderStatusBadge } from "@/components/admin/OrderFilters";
import { prisma } from "@/lib/prisma";
import { adminUi } from "@/lib/admin-ui";

export const dynamic = "force-dynamic";

const fulfillmentLabel = {
  pickup: "איסוף",
  delivery: "משלוח",
} as const;

const paymentLabel = {
  bank_transfer: "העברה בנקאית",
  on_pickup: "תשלום באיסוף",
} as const;

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: { include: { translations: true } },
          options: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin/orders" className={`text-sm ${adminUi.link}`}>
            ← חזרה לרשימה
          </Link>
          <h1 className={`mt-2 ${adminUi.h1}`}>הזמנה {order.id.slice(-8)}</h1>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className={adminUi.section}>
          <h2 className={adminUi.h2}>פרטי לקוח</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className={adminUi.muted}>שם</dt>
              <dd>{order.customer_name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className={adminUi.muted}>טלפון</dt>
              <dd dir="ltr">{order.customer_phone}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className={adminUi.muted}>אימייל</dt>
              <dd dir="ltr">{order.customer_email}</dd>
            </div>
          </dl>
        </section>

        <section className={adminUi.section}>
          <h2 className={adminUi.h2}>מילוי ותשלום</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className={adminUi.muted}>אופן אספקה</dt>
              <dd>{fulfillmentLabel[order.fulfillment_type]}</dd>
            </div>
            {order.delivery_address ? (
              <div className="flex justify-between gap-4">
                <dt className={adminUi.muted}>כתובת</dt>
                <dd className="max-w-xs text-left">{order.delivery_address}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4">
              <dt className={adminUi.muted}>תאריך מילוי מבוקש</dt>
              <dd>{order.requested_fulfillment_date.toLocaleDateString("he-IL")}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className={adminUi.muted}>תשלום</dt>
              <dd>{paymentLabel[order.payment_method]}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className={adminUi.muted}>נוצרה</dt>
              <dd>{order.created_at.toLocaleString("he-IL")}</dd>
            </div>
          </dl>
        </section>
      </div>

      {order.customer_notes ? (
        <section className={adminUi.section}>
          <h2 className={adminUi.h2}>הערות לקוח</h2>
          <p className="mt-2 text-sm">{order.customer_notes}</p>
        </section>
      ) : null}

      <section className={adminUi.section}>
        <h2 className={adminUi.h2}>פריטים</h2>
        <div className={`mt-4 ${adminUi.table}`}>
          <table className="min-w-full text-sm">
            <thead className={adminUi.tableHead}>
              <tr>
                <th className="px-4 py-3 text-right font-medium">מוצר</th>
                <th className="px-4 py-3 text-right font-medium">כמות</th>
                <th className="px-4 py-3 text-right font-medium">מחיר יחידה</th>
                <th className="px-4 py-3 text-right font-medium">סה״כ</th>
                <th className="px-4 py-3 text-right font-medium">אפשרויות</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => {
                const name =
                  item.product.translations.find((t) => t.locale === "he")?.name ??
                  item.product.translations[0]?.name ??
                  item.product_id;
                const options = item.options
                  .map((o) => `${o.option_name_snapshot}: ${o.option_value_snapshot}`)
                  .join(", ");
                return (
                  <tr key={item.id} className={adminUi.tableRow}>
                    <td className="px-4 py-3">{name}</td>
                    <td className="px-4 py-3">{item.quantity}</td>
                    <td className="px-4 py-3">₪{item.unit_price.toString()}</td>
                    <td className={`px-4 py-3 ${adminUi.price}`}>₪{item.line_total.toString()}</td>
                    <td className={`px-4 py-3 ${adminUi.muted}`}>{options || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-end gap-6 text-sm">
          <span>
            ביניים: <strong>₪{order.subtotal.toString()}</strong>
          </span>
          <span className={adminUi.price}>
            סה״כ: <strong>₪{order.total.toString()}</strong>
          </span>
        </div>
      </section>

      <section className={adminUi.section}>
        <h2 className={adminUi.h2}>פעולות</h2>
        <div className="mt-4">
          <OrderApproveRejectActions orderId={order.id} status={order.status} />
        </div>
      </section>
    </div>
  );
}
