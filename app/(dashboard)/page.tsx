import { HeroBanner } from "@/components/dashboard/HeroBanner";
import { RingkasanStats } from "@/components/dashboard/RingkasanStats";
import { PenjualanPanel } from "@/components/dashboard/PenjualanPanel";
import { AntreanPesananTable } from "@/components/dashboard/AntreanPesananTable";
import { KategoriCard } from "@/components/dashboard/KategoriCard";
import { LogistikKurirCard, StokKritisCard } from "@/components/dashboard/SidePanels";
import { PengaduanTerbaruCard, UlasanTerbaruCard } from "@/components/dashboard/PengaduanUlasanCards";

// Halaman ini hanya menyusun komponen. Semua tombol di Ringkasan membuka modal
// lewat useDetail() (lihat components/detail/DetailProvider.tsx), dan datanya
// berasal dari DashboardDataProvider supaya satu perubahan terlihat di mana-mana.
//
// Urutan: sapaan → kartu angka → penjualan harian + Top 5 → antrean + stok kritis → 4 kartu kecil.
// Tiap baris memakai grid 12 kolom dengan tinggi sejajar (items-stretch): pembungkus sel berupa
// flex column dan kartu di dalamnya meregang (`[&>*]:flex-1`), jadi proporsinya seimbang.
const SEL = "flex min-w-0 flex-col [&>*]:flex-1";

export default function RingkasanPage() {
  return (
    <>
      <HeroBanner />
      <RingkasanStats />

      <PenjualanPanel />

      <div className="grid grid-cols-12 items-stretch gap-6">
        <div className={`col-span-12 xl:col-span-8 ${SEL}`}>
          <AntreanPesananTable />
        </div>
        <div className={`col-span-12 xl:col-span-4 ${SEL}`}>
          <StokKritisCard />
        </div>
      </div>

      <div className="grid grid-cols-12 items-stretch gap-6">
        {[LogistikKurirCard, PengaduanTerbaruCard, UlasanTerbaruCard, KategoriCard].map((Kartu, i) => (
          <div key={i} className={`col-span-12 sm:col-span-6 xl:col-span-3 ${SEL}`}>
            <Kartu />
          </div>
        ))}
      </div>
    </>
  );
}
