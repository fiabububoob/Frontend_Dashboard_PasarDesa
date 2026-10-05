import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { AppProviders } from "@/components/providers/AppProviders";

// Every route inside app/(dashboard)/ automatically gets this shell —
// Sidebar + Topbar + a scrollable content area, plus the toast & confirm-dialog
// providers (useToast / useConfirm) yang bisa dipakai di semua halaman.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProviders>
      <div className="flex h-screen overflow-hidden bg-surface">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto px-4 pb-8 pt-2 lg:px-8">
            <div className="mx-auto max-w-[1400px] space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </AppProviders>
  );
}
