import Link from "next/link";
import { notFound } from "next/navigation";
import { registerCustomer } from "@/lib/actions/orders";
import { getMessages, isLocale, type Locale } from "@/lib/i18n";

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale: localeParam } = await params;
  const { error } = await searchParams;
  if (!isLocale(localeParam)) {
    notFound();
  }
  const locale = localeParam as Locale;
  const messages = getMessages(locale);

  return (
    <div className="mm-wrap">
      <div className="mx-auto max-w-md space-y-6 rounded-2xl border border-mm-line bg-mm-surface p-6 md:p-8">
        <h1 className="font-heading text-4xl text-mm-primary">{messages.registerTitle}</h1>
        <form action={registerCustomer} className="space-y-4">
          <input type="hidden" name="locale" value={locale} />
          <label className="block space-y-1 text-sm text-mm-secondary">
            <span>{messages.fullName}</span>
            <input name="fullName" required className="mm-field" />
          </label>
          <label className="block space-y-1 text-sm text-mm-secondary">
            <span>{messages.phone}</span>
            <input name="phone" required className="mm-field" />
          </label>
          <label className="block space-y-1 text-sm text-mm-secondary">
            <span>{messages.email}</span>
            <input name="email" type="email" required className="mm-field" />
          </label>
          <label className="block space-y-1 text-sm text-mm-secondary">
            <span>{messages.password}</span>
            <input name="password" type="password" required minLength={6} className="mm-field" />
          </label>
          {error ? <p className="text-sm text-red-700">{messages.errorGeneric}</p> : null}
          <button type="submit" className="mm-btn">
            {messages.registerSubmit}
          </button>
        </form>
        <Link href={`/${locale}/login`} className="cursor-pointer text-sm text-mm-primary hover:underline">
          {messages.navLogin}
        </Link>
      </div>
    </div>
  );
}
