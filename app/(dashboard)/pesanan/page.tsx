import { PesananWorkspace } from "@/components/pesanan/PesananWorkspace";

// Halaman ini hanya memasang workspace. Statistik, tab status, daftar, detail,
// dan alur status pesanan ada di PesananWorkspace dan memakai data hidup dari
// DashboardDataProvider (data awal: lib/data/pesanan.ts).
export default function PesananPage() {
  return <PesananWorkspace />;
}
