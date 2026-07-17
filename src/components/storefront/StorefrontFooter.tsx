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
  const hours =
    settings.business_hours?.trim() ||
    messages.hoursLabel;
  const phone = settings.phone?.trim();
  const address = settings.pickup_address?.trim();
  const lead = settings.lead_time_note?.trim();

  return (
    <footer className="mt-auto border-t border-mm-line bg-mm-soft py-12">
      <div className="mm-wrap grid gap-8 text-center md:grid-cols-[1.2fr_1fr] md:text-start">
        <div>
          <p className="font-brand text-3xl tracking-wide text-mm-primary">
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
          <p className="text-xs font-semibold uppercase tracking-wide text-mm-word">
            {messages.contactLabel}
          </p>
          <p className="mt-3 text-sm text-mm-secondary">{hours}</p>
          {phone ? (
            <p className="mt-2 text-sm text-mm-primary" dir="ltr">
              {phone}
            </p>
          ) : null}
          {address ? (
            <p className="mt-2 text-sm text-mm-secondary">{address}</p>
          ) : null}
          <nav className="mt-4 flex flex-col gap-2 text-sm">
            <Link
              href={`/${locale}/catalog`}
              className="cursor-pointer text-mm-primary hover:opacity-70"
            >
              {messages.navCatalog}
            </Link>
            <Link
              href={`/${locale}/cart`}
              className="cursor-pointer text-mm-primary hover:opacity-70"
            >
              {messages.navCart}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
