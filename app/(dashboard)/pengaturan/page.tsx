import { Card } from "@/components/ui/Card";
import { PengaturanForm } from "@/components/pengaturan/PengaturanForm";
import { ProfilForm } from "@/components/pengaturan/ProfilForm";
import { JadwalOperasionalCard } from "@/components/pengaturan/JadwalOperasionalCard";
import { TitikJemputCard } from "@/components/pengaturan/TitikJemputCard";
import { LivePreviewCard } from "@/components/pengaturan/LivePreviewCard";

// Halaman ini hanya menyusun komponen. Alur Simpan/Batal (validasi, dialog
// konfirmasi, loading, toast) ada di <PengaturanForm>.
export default function PengaturanPage() {
  return (
    <PengaturanForm title="Pengaturan" description="Atur profil lapak, jam buka, dan titik penjemputan kurir.">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
        <Card className="min-w-0 divide-y divide-line">
          <ProfilForm />
          <JadwalOperasionalCard />
          <TitikJemputCard />
        </Card>
        <div className="xl:sticky xl:top-6">
          <LivePreviewCard />
        </div>
      </div>
    </PengaturanForm>
  );
}
