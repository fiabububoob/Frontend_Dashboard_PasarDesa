import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { AppProviders } from "@/components/providers/AppProviders";
import { getUser } from "@/lib/server/session";

// Setiap route di dalam app/(dashboard)/ otomatis memakai kerangka ini —
// Sidebar + Topbar + area konten yang bisa di-scroll, plus provider toast & dialog konfirmasi.
// Layout ini juga gerbang login: token tidak valid/kedaluwarsa → /sesi-berakhir (hapus cookie) → /login.
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/sesi-berakhir");

  return (
    <AppProviders profilAwal={{ nama: user.nama, jabatan: user.jabatan, foto: user.foto }}>
      <div className="flex h-screen overflow-hidden bg-canvas">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto px-4 pb-10 pt-6 lg:px-8">
            <div className="mx-auto max-w-[1400px] space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </AppProviders>
  );
}