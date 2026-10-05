import { KomoditasWorkspace } from "@/components/komoditas/KomoditasWorkspace";

// Halaman ini hanya memasang workspace. Statistik, filter kategori, pencarian,
// paginasi, tambah/ubah/impor/ekspor semuanya ada di KomoditasWorkspace dan
// memakai data hidup dari DashboardDataProvider (data awal: lib/data/komoditas.ts).
export default function KomoditasPage() {
  return <KomoditasWorkspace />;
}
