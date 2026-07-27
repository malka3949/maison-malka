import Link from "next/link";
import { notFound } from "next/navigation";
import { registerCustomer } from "@/lib/actions/orders";
import { isLocale, type Locale, type Messages } from "@/lib/i18n";
import { loadMergedStorefrontMessages } from "@/lib/site-cms";

function registerErrorMessage(
  code: string | undefined,
  messages: Messages,
): string | null {
  if (!code) return null;
  switch (code) {
    case "accepted_terms":
      return messages.errorAcceptedTerms;
    case "invalid_phone":
      return messages.errorInvalidPhone;
    case "rate_limited":
      return messages.errorRateLimited;
    case "1": // legacy query param
    case "generic":
    default:
      return messages.errorGeneric;
  }
}

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
  const messages = await loadMergedStorefrontMessages(locale);
  const errorText = registerErrorMessage(error, messages);

  return (
    <div className="mm-wrap mm-page">
      <div className="mm-auth-shell mm-panel space-y-6">
        <h1 className="mm-page-title font-heading">{messages.registerTitle}</h1>
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
          <label className="flex cursor-pointer items-start gap-2 text-sm text-mm-secondary">
            <input
              type="checkbox"
              name="acceptedTerms"
              required
              className="mt-1"
            />
            <span>
              {messages.acceptTerms}{" "}
              <Link
                href={`/${locale}/privacy`}
                className="text-mm-primary underline"
              >
                {messages.legalPrivacy}
              </Link>
              {" · "}
              <Link
                href={`/${locale}/terms`}
                className="text-mm-primary underline"
              >
                {messages.legalTerms}
              </Link>
              {" · "}
              <Link
                href={`/${locale}/cancellation`}
                className="text-mm-primary underline"
              >
                {messages.legalCancellation}
              </Link>
            </span>
          </label>
          {errorText ? <p className="text-sm text-red-700">{errorText}</p> : null}
          <button type="submit" className="mm-btn">
            {messages.registerSubmit}
          </button>
        </form>
        <Link href={`/${locale}/login`} className="mm-section-link w-fit text-sm">
          {messages.navLogin}
        </Link>
      </div>
    </div>
  );
}
