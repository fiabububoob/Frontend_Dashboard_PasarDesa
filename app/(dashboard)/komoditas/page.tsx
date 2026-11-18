import { KomoditasWorkspace } from "@/components/komoditas/KomoditasWorkspace";

// Seluruh halaman Komoditas (tab status, filter, tampilan daftar/kartu, form 5 langkah)
// ada di KomoditasWorkspace dan memakai data hidup dari DashboardDataProvider.
export default function KomoditasPage() {
  return <KomoditasWorkspace />;
}
