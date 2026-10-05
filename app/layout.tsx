import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Inter: body text & tables — tuned for legibility at small sizes.
// Plus Jakarta Sans: headings only — warmer and friendlier than Inter alone,
// a common pairing for approachable (non-enterprise-cold) SaaS products.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PasarDesa Portal Sukorejo",
  description: "Dashboard admin BUMDes Sukorejo — kelola komoditas, pesanan, kas, dan lapak tani.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="font-sans text-ink-900">{children}</body>
    </html>
  );
}
