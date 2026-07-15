"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { LOCALES } from "@/lib/i18n";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname() || `/${locale}`;
  const rest = pathname.replace(/^\/(he|en)/, "") || "";

  return (
    <div
      className="inline-flex overflow-hidden border border-mm-line bg-mm-surface"
      aria-label="Language"
    >
      {LOCALES.map((l) => (
        <Link
          key={l}
          href={`/${l}${rest}`}
          className={`cursor-pointer px-2.5 py-1 text-[0.75rem] font-semibold uppercase tracking-wide transition-colors ${
            l === locale
              ? "bg-mm-dark text-white"
              : "text-mm-secondary hover:text-mm-primary"
          }`}
        >
          {l}
        </Link>
      ))}
    </div>
  );
}
