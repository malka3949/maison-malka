import Link from "next/link";
import { notFound } from "next/navigation";
import { Locale as PrismaLocale } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getMessages, isLocale, type Locale } from "@/lib/i18n";
import { orderStatusLabel } from "@/lib/orders/status";

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { locale: localeParam, id } = await params;
  const { t: accessToken } = await searchParams;
  if (!isLocale(localeParam) || !accessToken?.trim()) {
    notFound();
  }
  const locale = localeParam as Locale;
  const messages = getMessages(locale);
  const prismaLocale = locale === "en" ? PrismaLocale.en : PrismaLocale.he;

  const order = await prisma.order.findFirst({
    where: { id, access_token: accessToken.trim() },
    select: {
      id: true,
      status: true,
      payment_method: true,
      subtotal: true,
      total: true,
      items: {
        select: {
          quantity: true,
          unit_price: true,
          line_total: true,
          product: {
            select: {
              translations: {
                where: { locale: prismaLocale },
                select: { name: true },
                take: 1,
              },
            },
          },
          options: {
            select: {
              option_name_snapshot: true,
              option_value_snapshot: true,
            },
          },
        },
      },
    },
  });
  if (!order) {
    notFound();
  }

  return (
    <div className="mm-wrap pt-8 pb-12">
      <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-mm-line bg-mm-surface p-8">
        <div className="space-y-2 text-center">
          <h1 className="font-heading text-4xl text-mm-primary">
            {messages.orderSuccess}
          </h1>
          <p className="text-mm-secondary">{messages.orderSuccessBody}</p>
          <p className="text-sm text-mm-secondary">
            {messages.orderId}:{" "}
            <span className="font-mono text-mm-primary">{order.id}</span>
          </p>
          <p className="text-sm text-mm-secondary">
            {messages.orderStatusLabel}:{" "}
            <span className="font-medium text-mm-primary">
              {orderStatusLabel(order.status, locale)}
            </span>
          </p>
        </div>

        <div className="space-y-2 border-t border-mm-line pt-4 text-start">
          <p className="text-sm font-medium text-mm-primary">{messages.orderItems}</p>
          <ul className="space-y-3">
            {order.items.map((item, idx) => {
              const name =
                item.product.translations[0]?.name ??
                (locale === "en" ? "Product" : "מוצר");
              return (
                <li
                  key={`${order.id}-${idx}`}
                  className="rounded-xl border border-mm-line bg-mm-soft/40 p-3 text-sm"
                >
                  <p className="font-medium text-mm-primary">
                    {name} × {item.quantity}
                  </p>
                  {item.options.length ? (
                    <ul className="mt-1 space-y-0.5 text-xs text-mm-secondary">
                      {item.options.map((o) => (
                        <li key={`${o.option_name_snapshot}-${o.option_value_snapshot}`}>
                          {o.option_name_snapshot}: {o.option_value_snapshot}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <p className="mt-1 text-xs text-mm-secondary">
                    {messages.lineTotal}: {messages.ils}
                    {Number(item.line_total).toFixed(2)}
                  </p>
                </li>
              );
            })}
          </ul>
          <p className="pt-2 text-sm font-medium text-mm-primary">
            {messages.total}: {messages.ils}
            {Number(order.total).toFixed(2)}
          </p>
        </div>

        {order.payment_method === "bank_transfer" ? (
          <p className="rounded-xl border border-mm-line bg-mm-soft p-3 text-sm leading-relaxed text-mm-secondary">
            {messages.bankTransferNextSteps}
          </p>
        ) : null}

        <div className="text-center">
          <Link href={`/${locale}`} className="mm-btn inline-flex">
            {messages.backHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
