import Link from "next/link";
import { notFound } from "next/navigation";
import { loginCustomer } from "@/lib/actions/orders";
import { isLocale, type Locale } from "@/lib/i18n";
import { loadMergedStorefrontMessages } from "@/lib/site-cms";

export default async function LoginPage({
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
  const messages = await loadMergedStorefrontMessages(locale);
  const errorText =
    error === "rate_limited"
      ? messages.errorRateLimited
      : error
        ? messages.errorGeneric
        : null;

  return (
    <div className="mm-wrap mm-page">
      <div className="mm-auth-shell mm-panel space-y-6">
        <h1 className="mm-page-title font-heading">{messages.loginTitle}</h1>
        <form action={loginCustomer} className="space-y-4">
          <input type="hidden" name="locale" value={locale} />
          <label className="block space-y-1 text-sm text-mm-secondary">
            <span>{messages.email}</span>
            <input name="email" type="email" required className="mm-field" />
          </label>
          <label className="block space-y-1 text-sm text-mm-secondary">
            <span>{messages.password}</span>
            <input name="password" type="password" required className="mm-field" />
          </label>
          {errorText ? <p className="text-sm text-red-700">{errorText}</p> : null}
          <button type="submit" className="mm-btn">
            {messages.loginSubmit}
          </button>
        </form>
        <div className="flex flex-col gap-2 text-sm">
          <Link
            href={`/${locale}/register`}
            className="mm-section-link w-fit"
          >
            {messages.navRegister}
          </Link>
          <Link
            href={`/${locale}/checkout`}
            className="mm-section-link w-fit"
          >
            {messages.continueAsGuest}
          </Link>
        </div>
      </div>
    </div>
  );
}
