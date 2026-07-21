import type { Metadata } from "next";
import { Cormorant, Heebo } from "next/font/google";
import "./globals.css";

/** Refined editorial serif — brand wordmark + English display. */
const cormorant = Cormorant({
  subsets: ["latin", "latin-ext"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/** Clean Hebrew UI + Hebrew headings. */
const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Maison Malka",
  description: "Boutique pastry atelier in Jerusalem",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      suppressHydrationWarning
      className={`${cormorant.variable} ${heebo.variable}`}
    >
      <body className="font-sans antialiased bg-mm-bg text-mm-text">
        {children}
      </body>
    </html>
  );
}
