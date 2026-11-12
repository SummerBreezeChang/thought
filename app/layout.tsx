import type { Metadata, Viewport } from "next";
import { Figtree, Young_Serif } from "next/font/google";
import "./globals.css";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree", display: "swap" });
const youngSerif = Young_Serif({ subsets: ["latin"], weight: "400", variable: "--font-young-serif", display: "swap" });

export const metadata: Metadata = {
  title: "Thought",
  description: "Thoughtful gifts from grandparents abroad: real experiences for their US grandkids, paid with PayPal in their own currency.",
};

export const viewport: Viewport = {
  themeColor: "oldlace",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${figtree.variable} ${youngSerif.variable}`}>
      <body className="min-h-full bg-th-bg text-th-label">{children}</body>
    </html>
  );
}
