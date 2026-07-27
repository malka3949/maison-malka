import Link from "next/link";
import type { Locale, Messages } from "@/lib/i18n";
import type { SiteSettingsMap } from "@/lib/site-content";

export function StorefrontFooter({
  locale,
  messages,
  settings = {},
}: {
  locale: Locale;
  messages: Messages;
  settings?: SiteSettingsMap;
}) {
  const lead = settings.lead_time_note?.trim();

  return (
    <footer className="mm-footer mt-auto">
      <div className="mm-wrap grid gap-8 text-center md:grid-cols-[1.2fr_1fr] md:text-start">
        <div>
          <p className="font-brand text-3xl tracking-tight text-mm-primary">
            {messages.brand}
          </p>
          <p className="mt-1 text-[0.65rem] uppercase tracking-[0.2em] text-mm-secondary">
            {messages.brandTagline}
          </p>
          <p className="mx-auto mt-4 max-w-md text-sm text-mm-secondary md:mx-0">
            {messages.footerNote}
          </p>
          {lead ? (
            <p className="mx-auto mt-2 max-w-md text-sm text-mm-secondary md:mx-0">
              {lead}
            </p>
          ) : null}
        </div>

        <div>
          <nav className="flex flex-col gap-2.5 text-sm">
            <Link href={`/${locale}/catalog`} className="mm-footer-link">
              {messages.navCatalog}
            </Link>
            <Link href={`/${locale}/cart`} className="mm-footer-link">
              {messages.navCart}
            </Link>
            <Link href={`/${locale}/contact`} className="mm-footer-link">
              {messages.contactLabel}
            </Link>
            <Link href={`/${locale}/privacy`} className="mm-footer-link">
              {messages.legalPrivacy}
            </Link>
            <Link href={`/${locale}/terms`} className="mm-footer-link">
              {messages.legalTerms}
            </Link>
            <Link href={`/${locale}/cancellation`} className="mm-footer-link">
              {messages.legalCancellation}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
