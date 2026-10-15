import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getUser } from "@/lib/server/session";

// Admin yang sudah login tidak perlu melihat login/register lagi → kirim ke dashboard.
// Token diverifikasi ke backend (bukan sekadar cek cookie); bila backend mati, halaman login tetap tampil.
export default async function AuthLayout({ children }: { children: ReactNode }) {
  const user = await getUser().catch(() => null);
  if (user) redirect("/");
  return <>{children}</>;
}