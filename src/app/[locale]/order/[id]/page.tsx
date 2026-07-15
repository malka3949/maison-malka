import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getMessages, isLocale, type Locale } from "@/lib/i18n";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: localeParam, id } = await params;
  if (!isLocale(localeParam)) {
    notFound();
  }
  const locale = localeParam as Locale;
  const messages = getMessages(locale);

  const order = await prisma.order.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!order) {
    notFound();
  }

  return (
    <div className="mm-wrap pt-8">
      <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-mm-line bg-mm-surface p-8 text-center">
        <h1 className="font-heading text-4xl text-mm-primary">{messages.orderSuccess}</h1>
        <p className="text-mm-secondary">{messages.orderSuccessBody}</p>
        <p className="text-sm text-mm-secondary">
          {messages.orderId}:{" "}
          <span className="font-mono text-mm-primary">{order.id}</span>
        </p>
        <Link href={`/${locale}`} className="mm-btn inline-flex">
          {messages.backHome}
        </Link>
      </div>
    </div>
  );
}
