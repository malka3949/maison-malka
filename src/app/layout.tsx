import type { Metadata } from "next";
import { Great_Vibes, Heebo } from "next/font/google";
import "./globals.css";

/** Elegant Latin script — English headings + brand wordmark. */
const greatVibes = Great_Vibes({
  subsets: ["latin", "latin-ext"],
  variable: "--font-great-vibes",
  weight: "400",
  display: "swap",
});

/** Clean Hebrew UI + organized Hebrew headings. */
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
      className={`${greatVibes.variable} ${heebo.variable}`}
    >
      <body className="font-sans antialiased bg-mm-bg text-mm-text">
        {children}
      </body>
    </html>
  );
}
