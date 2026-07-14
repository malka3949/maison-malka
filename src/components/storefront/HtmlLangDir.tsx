"use client";

import { useEffect } from "react";
import type { Locale } from "@/lib/i18n";
import { localeDir } from "@/lib/i18n";

export function HtmlLangDir({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = localeDir(locale);
  }, [locale]);
  return null;
}
