import { notFound } from "next/navigation";
import { ContactMessageDialog } from "@/components/storefront/ContactMessageDialog";
import { isLocale, type Locale } from "@/lib/i18n";
import {
  loadMergedStorefrontMessages,
  loadSiteSettingsMap,
} from "@/lib/site-cms";
import { resolveBusinessContact } from "@/lib/site-content";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;

  const [messages, settings] = await Promise.all([
    loadMergedStorefrontMessages(locale),
    loadSiteSettingsMap(),
  ]);
  const contact = resolveBusinessContact(settings, messages);
  const hours = settings.business_hours?.trim() || contact.hours;
  const hasAny =
    Boolean(contact.phone) ||
    Boolean(contact.email) ||
    Boolean(contact.address) ||
    Boolean(hours);

  return (
    <div className="mm-wrap py-10 pb-16">
      <div className="mx-auto max-w-lg space-y-6 text-center md:text-start">
        <h1 className="font-heading text-4xl text-mm-primary md:text-5xl">
          {messages.contactLabel}
        </h1>
        <div className="space-y-4 text-sm leading-relaxed text-mm-secondary">
          {contact.phone ? (
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wide text-mm-word">
                {messages.phone}
              </span>
              <a
                href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
                className="mt-1 inline-block cursor-pointer text-base text-mm-primary hover:opacity-70"
                dir="ltr"
              >
                {contact.phone}
              </a>
            </div>
          ) : null}
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wide text-mm-word">
              {messages.email}
            </span>
            <ContactMessageDialog
              locale={locale}
              messages={messages}
              shopEmail={contact.email}
            />
          </div>
          {contact.address ? (
            <p className="text-base text-mm-primary">{contact.address}</p>
          ) : null}
          {hours ? (
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wide text-mm-word">
                {messages.hoursLabel}
              </span>
              <span className="mt-1 block text-base text-mm-primary">
                {hours}
              </span>
            </div>
          ) : null}
          {!hasAny ? <p>{messages.footerNote}</p> : null}
        </div>
      </div>
    </div>
  );
}
