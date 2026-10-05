import { PengaturanForm } from "@/components/pengaturan/PengaturanForm";
import { StatusSummaryStrip } from "@/components/pengaturan/StatusSummaryStrip";
import { ProfilForm } from "@/components/pengaturan/ProfilForm";
import { JadwalOperasionalCard } from "@/components/pengaturan/JadwalOperasionalCard";
import { DropPointCard } from "@/components/pengaturan/DropPointCard";
import { LivePreviewCard, JaminanTransaksiCard, PusatBantuanCard } from "@/components/pengaturan/SidePanels";

// Halaman ini hanya menyusun komponen. Alur Simpan/Batal (validasi, dialog
// konfirmasi, loading, toast) ada di <PengaturanForm>.
export default function PengaturanPage() {
  return (
    <PengaturanForm
      title="Pengaturan"
      description="Atur profil lapak, jam buka, dan titik penjemputan kurir."
    >
      <StatusSummaryStrip />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-6">
          <ProfilForm />
          <JadwalOperasionalCard />
          <DropPointCard />
        </div>
        <div className="space-y-6">
          <LivePreviewCard />
          <JaminanTransaksiCard />
          <PusatBantuanCard />
        </div>
      </div>
    </PengaturanForm>
  );
}
