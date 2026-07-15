import type { Messages } from "@/lib/i18n";

export function StorefrontFooter({ messages }: { messages: Messages }) {
  return (
    <footer className="mt-auto border-t border-mm-line bg-mm-soft py-12 text-center">
      <p className="font-heading text-3xl tracking-wide text-mm-primary">{messages.brand}</p>
      <p className="mt-1 text-[0.65rem] uppercase tracking-[0.2em] text-mm-secondary">
        {messages.brandTagline}
      </p>
      <p className="mx-auto mt-4 max-w-md text-sm text-mm-secondary">{messages.footerNote}</p>
    </footer>
  );
}
