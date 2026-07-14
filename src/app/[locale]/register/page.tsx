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
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="font-heading text-4xl text-mm-primary">{messages.registerTitle}</h1>
      <form action={registerCustomer} className="space-y-4">
        <input type="hidden" name="locale" value={locale} />
        <label className="block space-y-1 text-sm">
          <span>{messages.fullName}</span>
          <input name="fullName" required className="w-full border border-stone-300 px-3 py-2" />
        </label>
        <label className="block space-y-1 text-sm">
          <span>{messages.phone}</span>
          <input name="phone" required className="w-full border border-stone-300 px-3 py-2" />
        </label>
        <label className="block space-y-1 text-sm">
          <span>{messages.email}</span>
          <input
            name="email"
            type="email"
            required
            className="w-full border border-stone-300 px-3 py-2"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>{messages.password}</span>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="w-full border border-stone-300 px-3 py-2"
          />
        </label>
        {error ? <p className="text-sm text-red-700">{messages.errorGeneric}</p> : null}
        <button
          type="submit"
          className="cursor-pointer rounded-sm bg-mm-cta px-6 py-3 text-white hover:bg-mm-cta-hover"
        >
          {messages.registerSubmit}
        </button>
      </form>
      <Link href={`/${locale}/login`} className="text-sm text-mm-cta cursor-pointer">
        {messages.navLogin}
      </Link>
    </div>
  );
}
