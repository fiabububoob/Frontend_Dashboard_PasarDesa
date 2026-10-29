import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Plus Jakarta Sans dipakai untuk seluruh teks (judul & isi) sesuai desain.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PasarDesa Portal Sukorejo",
  description: "Dashboard admin BUMDes Sukorejo — kelola komoditas, pesanan, kas, dan lapak tani.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${jakarta.variable}`}>
      <body className="font-sans text-ink-900">{children}</body>
    </html>
  );
}