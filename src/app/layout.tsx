import type { Metadata } from "next";
import { Cormorant, Heebo } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant({
  subsets: ["latin", "latin-ext"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600", "700"],
});

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  weight: ["300", "400", "500", "600", "700"],
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
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <body
        className={`${cormorant.variable} ${heebo.variable} font-sans antialiased bg-mm-bg text-mm-text`}
      >
        {children}
      </body>
    </html>
  );
}
