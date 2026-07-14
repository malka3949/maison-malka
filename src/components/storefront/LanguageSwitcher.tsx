"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { LOCALES } from "@/lib/i18n";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname() || `/${locale}`;
  const rest = pathname.replace(/^\/(he|en)/, "") || "";

  return (
    <div className="flex items-center gap-2 text-xs uppercase tracking-wider">
      {LOCALES.map((l) => (
        <Link
          key={l}
          href={`/${l}${rest}`}
          className={`cursor-pointer transition-colors ${
            l === locale ? "text-mm-cta font-semibold" : "text-mm-secondary hover:text-mm-cta"
          }`}
        >
          {l}
        </Link>
      ))}
    </div>
  );
}
