/**
 * Functional verification helper: creates a pending guest order like checkout.
 * Run: npx tsx scripts/verify-guest-order.ts
 */
import {
  FulfillmentType,
  OrderStatus,
  PaymentMethod,
  PrismaClient,
} from "@prisma/client";
import { minFulfillmentDate } from "../src/lib/fulfillment";
import { computeLineTotal, computeUnitPrice, sumMoney } from "../src/lib/pricing";

const prisma = new PrismaClient();

async function main() {
  const product = await prisma.product.findFirst({
    where: { is_available: true, category: { is_active: true } },
    include: { options: { include: { values: true } }, translations: true },
  });
  if (!product) {
    throw new Error("No available product — run seed first");
  }

  const selected = product.options.flatMap((opt) => {
    const v = opt.values.find((x) => x.is_default) ?? opt.values[0];
    return v
      ? [
          {
            id: v.id,
            optionName: opt.name_key,
            optionValue: v.label_key,
            delta: Number(v.price_delta),
          },
        ]
      : [];
  });

  const unit = computeUnitPrice(
    Number(product.base_price),
    selected.map((s) => s.delta),
  );
  const lineTotal = computeLineTotal(unit, 1);
  const total = sumMoney([lineTotal]);
  const date = minFulfillmentDate();
  // bump past Saturday if needed
  while (date.getDay() === 6) {
    date.setDate(date.getDate() + 1);
  }

  const order = await prisma.order.create({
    data: {
      status: OrderStatus.pending_approval,
      customer_name: "Verify Guest",
      customer_phone: "0500000000",
      customer_email: "verify-guest@example.com",
      fulfillment_type: FulfillmentType.pickup,
      requested_fulfillment_date: date,
      payment_method: PaymentMethod.on_pickup,
      subtotal: total,
      total,
      items: {
        create: [
          {
            product_id: product.id,
            quantity: 1,
            unit_price: unit,
            line_total: lineTotal,
            options: {
              create: selected.map((s) => ({
                product_option_value_id: s.id,
                option_name_snapshot: s.optionName,
                option_value_snapshot: s.optionValue,
                price_delta_snapshot: s.delta,
              })),
            },
          },
        ],
      },
    },
    include: { items: { include: { options: true } } },
  });

  console.log(
    JSON.stringify({
      orderId: order.id,
      status: order.status,
      total: Number(order.total),
      items: order.items.length,
      optionSnapshots: order.items[0]?.options.length ?? 0,
      product: product.translations[0]?.name ?? product.id,
    }),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
