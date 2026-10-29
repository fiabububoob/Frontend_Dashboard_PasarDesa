"use client";

import { Button } from "@/components/ui/Button";
import { Drawer, Stepper } from "@/components/ui/Drawer";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { useDetail } from "@/components/detail/DetailProvider";
import { StatusBadge } from "./StatusBadge";
import { StatusActionButton } from "./StatusActionButton";
import { KomplainPanel } from "./detail/KomplainPanel";
import { WARNA_TILE } from "@/components/komoditas/tampilan";
import { ONGKIR_FLAT, SUBSIDI_ONGKIR, TANGGAL_DATA_DUMMY } from "@/lib/constants";
import { formatRupiah, waLink } from "@/lib/format";
import { inisialProduk } from "@/lib/komoditas";
import { useSekarang } from "@/lib/hooks/useSekarang";
import { langkahBerikutnya, LABEL_METODE_BAYAR, sisaWaktuPelepasan, sudahLunas } from "@/lib/pesanan";
import { cariKomoditasByNama } from "@/lib/stok";
import type { Pesanan, StatusPesanan } from "@/types";

const LANGKAH = ["Diterima", "Sedang Dikemas", "Kurir Menjemput", "Drop-Point"];

// Posisi pesanan pada garis progres 4 tahap (indeks langkah aktif).
const POSISI: Record<StatusPesanan, number> = {
  "menunggu-pembayaran": 0,
  "perlu-dikemas": 1,
  "siap-jemput": 2,
  diantar: 2,
  "tiba-di-pos": 3,
  komplain: 3,
  selesai: 3,
  dibatalkan: 0,
};

const CATATAN_AKSI: Record<StatusPesanan, string> = {
  "menunggu-pembayaran": "Pesanan dibatalkan otomatis bila pembeli tidak membayar dalam 15 menit.",
  "perlu-dikemas": "Segel QR code akan dibuat saat status diubah menjadi siap diambil kurir.",
  "siap-jemput": "Segel QR sudah dibuat. Menunggu kurir desa menjemput paket.",
  diantar: "Paket sedang dibawa kurir ke drop-point tujuan.",
  "tiba-di-pos": "Paket sudah di pos. Dana Anda dilepas setelah pembeli menerima pesanan.",
  komplain: "Dana pesanan ditahan sampai komplain selesai. Pelepasan otomatis dihentikan.",
  selesai: "Pembeli sudah menerima pesanan. Dana sudah masuk saldo aktif Anda.",
  dibatalkan: "Pesanan dibatalkan. Tidak ada dana yang masuk ke kas.",
};

function teksKurir(p: Pesanan): string[] {
  if (p.opsiPengiriman === "ambil-mandiri") return ["Pembeli mengambil sendiri di pos, jadi tidak memakai kurir."];
  if (!p.kurir) return ["Menunggu penugasan kurir dari BUMDes setelah paket siap."];
  const dasar = [p.kurir.nama, p.kurir.armada];
  if (p.status === "selesai") return [...dasar, `Diterima di ${p.dropPoint}.`];
  if (p.status === "siap-jemput") return [...dasar, `Jadwal jemput sore: ${p.kurir.jadwal}. Menunggu kurir tiba.`];
  return [...dasar, `Jadwal jemput sore: ${p.kurir.jadwal}`];
}

function Kartu({ judul, children }: { judul: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line p-4 text-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">{judul}</p>
      {children}
    </div>
  );
}

function Baris({ label, nilai, className = "text-ink-700" }: { label: string; nilai: string; className?: string }) {
  return (
    <div className={`flex justify-between ${className}`}>
      <span>{label}</span>
      <span>{nilai}</span>
    </div>
  );
}

// Detail satu pesanan dalam panel samping: progres 4 tahap, rincian komoditas & biaya, kartu pembeli/kurir,
// serta tombol langkah berikutnya (aturan siapa boleh mengubah status ada di lib/pesanan.ts).
export function PesananDrawer({ id }: { id: string }) {
  const { pesanan, komoditas } = useDashboardData();
  const { close, push } = useDetail();
  const sekarang = useSekarang();
  const p = pesanan.find((x) => x.id === id);

  if (!p) {
    return (
      <Drawer title="Pesanan" onClose={close}>
        <p className="text-sm text-ink-500">Pesanan tidak ditemukan.</p>
      </Drawer>
    );
  }

  const subtotal = p.items.reduce((sum, i) => sum + i.subtotal, 0);
  const sisa = sekarang ? sisaWaktuPelepasan(p, sekarang) : undefined;
  const pesanWa = `Halo ${p.pembeli}, pesanan #${p.id} dari BUMDes Sukorejo sedang kami proses. Drop-point: ${p.dropPoint}.`;
  const adaLangkah = langkahBerikutnya(p) !== null;
  const jamMasuk = p.waktu.replace(/\s*WIB$/, "");

  return (
    <Drawer
      title={`Pesanan #${p.id}`}
      subtitle={`Masuk ${TANGGAL_DATA_DUMMY}, ${jamMasuk} WIB`}
      badge={<StatusBadge status={p.status} />}
      onClose={close}
      stepper={<Stepper steps={LANGKAH} current={POSISI[p.status]} />}
      footer={(tutup) => (
        <>
          <button type="button" onClick={() => push({ type: "nota", id: p.id })} className="rounded-lg px-1 py-2 text-sm font-semibold text-ink-700 hover:text-ink-900">
            Cetak Nota
          </button>
          <div className="ml-auto">
            {adaLangkah ? (
              <StatusActionButton key={`${p.id}-${p.status}`} pesanan={p} />
            ) : (
              <Button variant="secondary" className="border-brand-600 text-brand-700" onClick={tutup}>
                Tutup
              </Button>
            )}
          </div>
        </>
      )}
    >
      <div className="space-y-6">
        <section>
          <p className="mb-3 text-sm font-bold text-ink-900">Rincian Komoditas</p>
          <div className="space-y-3">
            {p.items.map((item) => {
              const katalog = cariKomoditasByNama(komoditas, item.komoditas);
              const warna = WARNA_TILE[Math.abs([...item.komoditas].reduce((a, c) => a + c.charCodeAt(0), 0)) % WARNA_TILE.length];
              return (
                <div key={item.komoditas} className="flex items-center gap-3 rounded-xl border border-line px-3.5 py-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-ink-900/80" style={{ backgroundColor: warna }} aria-hidden>
                    {inisialProduk(item.komoditas)}
                  </span>
                  <div className="min-w-0 flex-1">
                    {katalog ? (
                      <button type="button" onClick={() => push({ type: "komoditas", id: katalog.id })} className="text-left text-sm font-bold text-ink-900 hover:text-brand-700">
                        {item.komoditas}
                      </button>
                    ) : (
                      <p className="text-sm font-bold text-ink-900">{item.komoditas}</p>
                    )}
                    <p className="text-xs text-ink-500">{item.jumlah}</p>
                  </div>
                  <p className="text-sm font-bold text-ink-900">{formatRupiah(item.subtotal)}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-2 text-sm">
          <Baris label="Subtotal hasil panen" nilai={formatRupiah(subtotal)} />
          {p.opsiPengiriman === "kurir-desa" ? (
            <>
              <Baris label="Subsidi ongkir logistik desa (BUMDes)" nilai={`-${formatRupiah(SUBSIDI_ONGKIR)}`} className="text-brand-700" />
              <Baris label="Ongkir kurir desa (flat dusun)" nilai={formatRupiah(ONGKIR_FLAT)} />
            </>
          ) : (
            <Baris label="Ongkir (ambil mandiri di pos)" nilai={formatRupiah(0)} />
          )}
          <div className="flex items-baseline justify-between border-t border-line pt-3">
            <span className="font-bold text-ink-900">
              {sudahLunas(p) ? "Total pembayaran lunas" : p.metodeBayar === "COD" ? "Total dibayar di tempat (COD)" : "Total tagihan"}
            </span>
            <span className="text-2xl font-bold text-brand-700">{formatRupiah(p.total)}</span>
          </div>
          <p className="text-xs text-ink-500">Metode bayar: {LABEL_METODE_BAYAR[p.metodeBayar]}</p>
        </section>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Kartu judul="Pembeli">
            <p className="mt-1.5 font-bold text-ink-900">{p.pembeli}</p>
            <p className="text-ink-700">{p.rtRw ? `${p.alamat.split(" RT")[0]} ${p.rtRw}` : p.alamat}</p>
            <p className="text-ink-700">Drop-point: {p.dropPoint}</p>
            {p.patokan && <p className="text-ink-500">Patokan: {p.patokan}</p>}
            {p.telepon ? (
              <a href={waLink(p.telepon, pesanWa)} target="_blank" rel="noopener noreferrer" className="mt-1.5 inline-block font-semibold text-brand-600 hover:underline">
                Hubungi via WhatsApp
              </a>
            ) : (
              <p className="mt-1.5 text-ink-400">Nomor warga belum tersedia</p>
            )}
          </Kartu>
          <Kartu judul="Kurir desa">
            <div className="mt-1.5 space-y-0.5 text-ink-700">
              {teksKurir(p).map((t, i) => (
                <p key={t} className={i === 0 && p.kurir && p.opsiPengiriman === "kurir-desa" ? "font-bold text-ink-900" : undefined}>
                  {t}
                </p>
              ))}
            </div>
          </Kartu>
        </div>

        {p.catatan && <p className="rounded-xl bg-surface-muted p-3 text-sm italic text-ink-500">&ldquo;{p.catatan}&rdquo;</p>}

        {p.komplain && <KomplainPanel key={`${p.id}-${p.komplain.status}`} pesanan={p} />}

        <p className="text-xs text-ink-500">
          {CATATAN_AKSI[p.status]}
          {sisa && ` Bila pembeli belum menerima, dana dilepas otomatis ${sisa} (selama tidak ada komplain).`}
        </p>
      </div>
    </Drawer>
  );
}
