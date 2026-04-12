import type { Metadata } from "next";
import { Frank_Ruhl_Libre } from "next/font/google";
import "./globals.css";

const frankRuhl = Frank_Ruhl_Libre({
  variable: "--font-frank-ruhl",
  subsets: ["latin", "hebrew"],
  weight: ["300", "400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "Shul Display Board",
  description: "Digital synagogue display board — zmanim, shiurim, announcements",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={`${frankRuhl.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#0a0a1a]">{children}</body>
    </html>
  );
}
