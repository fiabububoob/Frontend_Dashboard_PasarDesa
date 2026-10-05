import { HeroBanner } from "@/components/dashboard/HeroBanner";
import { RingkasanStats } from "@/components/dashboard/RingkasanStats";
import { TrenPanenChart } from "@/components/dashboard/TrenPanenChart";
import { AntreanPesananTable } from "@/components/dashboard/AntreanPesananTable";
import { KategoriCard } from "@/components/dashboard/KategoriCard";
import { LogistikKurirCard, StokKritisCard, WartaCard } from "@/components/dashboard/SidePanels";

// Halaman ini hanya menyusun komponen. Semua tombol di Ringkasan membuka modal
// lewat useDetail() (lihat components/detail/DetailProvider.tsx), dan datanya
// berasal dari DashboardDataProvider supaya satu perubahan terlihat di mana-mana.
export default function RingkasanPage() {
  return (
    <>
      <HeroBanner />
      <RingkasanStats />

      {/* Kolom kiri meregang setinggi kolom kanan; kartu antrean mengisi sisanya (flex-1) supaya sejajar. */}
      <div className="grid grid-cols-1 items-stretch gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <TrenPanenChart />
          <AntreanPesananTable />
        </div>
        <div className="space-y-6">
          <LogistikKurirCard />
          <StokKritisCard />
          <KategoriCard />
          <WartaCard />
        </div>
      </div>
    </>
  );
}
