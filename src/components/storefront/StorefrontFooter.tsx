import type { Messages } from "@/lib/i18n";

export function StorefrontFooter({ messages }: { messages: Messages }) {
  return (
    <footer className="mt-auto border-t border-stone-200/80 py-8 text-center text-sm text-mm-secondary">
      <p className="font-heading text-lg text-mm-primary">{messages.brand}</p>
      <p className="mt-2">{messages.footerNote}</p>
    </footer>
  );
}
