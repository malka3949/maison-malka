import { OrderStatus } from "@prisma/client";
import {
  approveOrderFormAction,
  completeOrderFormAction,
  rejectOrderFormAction,
} from "@/lib/actions/admin-orders";
import { adminUi } from "@/lib/admin-ui";

export function OrderApproveRejectActions({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  if (status === OrderStatus.pending_approval) {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-3">
          <form action={approveOrderFormAction}>
            <input type="hidden" name="id" value={orderId} />
            <button type="submit" className={adminUi.btnPrimary}>
              אישור הזמנה
            </button>
          </form>
          <form action={rejectOrderFormAction}>
            <input type="hidden" name="id" value={orderId} />
            <button type="submit" className={adminUi.btnSecondary}>
              דחיית הזמנה
            </button>
          </form>
        </div>
        <p className={`text-sm ${adminUi.muted}`}>
          באישור / דחייה נשלח ללקוח מייל בשפה שבה הזמין (עברית או אנגלית).
        </p>
      </div>
    );
  }

  if (
    status === OrderStatus.approved ||
    status === OrderStatus.payment_pending
  ) {
    return (
      <div className="space-y-3">
        <form action={completeOrderFormAction}>
          <input type="hidden" name="id" value={orderId} />
          <button type="submit" className={adminUi.btnPrimary}>
            סמן כהושלם
          </button>
        </form>
        <p className={`text-sm ${adminUi.muted}`}>
          סימון כהושלם שולח ללקוח מייל סיום הזמנה.
        </p>
      </div>
    );
  }

  return (
    <p className={`text-sm ${adminUi.muted}`}>
      לא ניתן לשנות סטטוס מהמצב הנוכחי.
    </p>
  );
}
