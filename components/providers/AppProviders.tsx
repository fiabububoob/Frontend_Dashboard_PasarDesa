"use client";

import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/Toast";
import { ConfirmProvider } from "@/components/ui/ConfirmDialog";
import { DashboardDataProvider } from "@/components/providers/DashboardDataProvider";
import { DetailProvider } from "@/components/detail/DetailProvider";
import type { ProfilPengguna } from "@/types";

// Satu tempat untuk semua provider tingkat-aplikasi. Menambah provider baru
// (mis. auth) cukup di sini; layout tidak perlu diubah.
// Urutan penting: DetailProvider memakai data & toast, jadi harus paling dalam.
export function AppProviders({ children, profilAwal }: { children: ReactNode; profilAwal?: ProfilPengguna }) {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <DashboardDataProvider profilAwal={profilAwal}>
          <DetailProvider>{children}</DetailProvider>
        </DashboardDataProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
}
