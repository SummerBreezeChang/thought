import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Thought",
  description: "Grandparents abroad give their grandkids the care they'd give in person, paid with PayPal.",
};

export const viewport: Viewport = {
  themeColor: "white",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-th-bg text-th-label">{children}</body>
    </html>
  );
}
