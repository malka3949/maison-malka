import { notFound } from "next/navigation";
import { getMessages, isLocale, type Locale } from "@/lib/i18n";
import { unsubscribeByTokenAction } from "@/lib/actions/campaigns";

export default async function UnsubscribePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  const messages = getMessages(locale);
  const { token } = await searchParams;

  let outcome: "success" | "invalid" | "failed" = "invalid";
  if (token?.trim()) {
    const result = await unsubscribeByTokenAction(token.trim());
    if (result.ok) outcome = "success";
    else if (result.error === "failed") outcome = "failed";
    else outcome = "invalid";
  }

  const body =
    outcome === "success"
      ? messages.unsubscribeSuccess
      : outcome === "failed"
        ? messages.unsubscribeFailed
        : messages.unsubscribeInvalid;

  return (
    <div className="mm-wrap py-10 pb-16">
      <h1 className="font-display text-3xl text-mm-word">{messages.unsubscribeTitle}</h1>
      <p className="mt-4 max-w-xl text-mm-secondary leading-relaxed">{body}</p>
    </div>
  );
}
