import { KasWorkspace } from "@/components/kas/KasWorkspace";

// Halaman ini hanya memasang workspace. Saldo, pencairan, riwayat mutasi,
// filter, dan laporan ada di KasWorkspace dan memakai data hidup dari
// DashboardDataProvider (data awal: lib/data/kas.ts).
export default function KasPage() {
  return <KasWorkspace />;
}
