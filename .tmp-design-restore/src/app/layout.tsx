import type { Metadata } from "next";
import { Rubik, Syne } from "next/font/google";
import "./globals.css";

/** Contemporary display — brand wordmark + English headlines. */
const syne = Syne({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

/** Modern geometric Hebrew + UI body. */
const rubik = Rubik({
  subsets: ["hebrew", "latin", "latin-ext"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
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
      className={`${syne.variable} ${rubik.variable}`}
    >
      <body className="font-sans antialiased bg-mm-bg text-mm-text">
        {children}
      </body>
    </html>
  );
}
