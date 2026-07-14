import type { Messages } from "@/lib/i18n";

export function StorefrontFooter({ messages }: { messages: Messages }) {
  return (
    <footer className="mt-auto border-t border-mm-line bg-mm-soft py-10 text-center">
      <p className="font-heading text-2xl text-mm-primary">{messages.brand}</p>
      <p className="mt-2 text-sm text-mm-secondary">{messages.footerNote}</p>
    </footer>
  );
}
