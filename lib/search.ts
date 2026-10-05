import type { DetailTarget, Komoditas, Pesanan, TransaksiKas, Warta } from "@/types";
import { kategoriList } from "@/lib/stok";
import { STATUS_LABEL } from "@/lib/pesanan";
import { formatRupiah } from "@/lib/format";
import { cocokSemuaKata } from "@/lib/text";

// Pencarian di Topbar. Semua data dummy (komoditas, pesanan, kategori, warta)
// bisa dicari lewat satu fungsi ini; tiap hasil membawa `target` yang langsung
// bisa dibuka lewat useDetail().open(target).
export interface HasilCari {
  key: string;
  grup: "Pesanan" | "Komoditas" | "Kategori" | "Transaksi" | "Warta";
  judul: string;
  keterangan: string;
  target: DetailTarget;
}

const MAKS_PER_GRUP = 5;

export function cari(query: string, data: { komoditas: Komoditas[]; pesanan: Pesanan[]; transaksi: TransaksiKas[]; warta: Warta[] }): HasilCari[] {
  const q = query.trim();
  if (!q) return [];

  const pesanan: HasilCari[] = data.pesanan
    .filter((p) =>
      cocokSemuaKata(q, p.id, p.pembeli, p.alamat, p.dropPoint, p.metodeBayar, STATUS_LABEL[p.status], ...p.items.map((i) => i.komoditas)),
    )
    .map((p) => ({
      key: `pesanan-${p.id}`,
      grup: "Pesanan",
      judul: `#${p.id}`,
      keterangan: `${p.pembeli} · ${STATUS_LABEL[p.status]} · ${p.items.map((i) => i.komoditas).join(", ")}`,
      target: { type: "pesanan", id: p.id },
    }));

  const komoditas: HasilCari[] = data.komoditas
    .filter((k) => cocokSemuaKata(q, k.nama, k.sku, k.kategori, k.asalBlok, k.tag, k.statusStok))
    .map((k) => ({
      key: `komoditas-${k.id}`,
      grup: "Komoditas",
      judul: `${k.gambar} ${k.nama}`,
      keterangan: `${k.kategori} · stok ${k.stok} ${k.satuan}`,
      target: { type: "komoditas", id: k.id },
    }));

  const kategori: HasilCari[] = kategoriList(data.komoditas)
    .filter((c) => cocokSemuaKata(q, c.nama))
    .map((c) => ({
      key: `kategori-${c.nama}`,
      grup: "Kategori",
      judul: c.nama,
      keterangan: `${c.count} komoditas${c.kritis ? ` · ${c.kritis} stok kritis` : ""}`,
      target: { type: "kategori", nama: c.nama },
    }));

  const transaksi: HasilCari[] = data.transaksi
    .filter((t) => cocokSemuaKata(q, t.deskripsi, t.referensi, t.kategori, t.status, t.tanggal))
    .map((t) => ({
      key: `transaksi-${t.id}`,
      grup: "Transaksi",
      judul: t.deskripsi,
      keterangan: `${t.tanggal} · ${t.nominal < 0 ? "-" : "+"}${formatRupiah(Math.abs(t.nominal))} · ${t.kategori}`,
      target: { type: "transaksi", id: t.id },
    }));

  const warta: HasilCari[] = data.warta
    .filter((w) => cocokSemuaKata(q, w.judul, w.isi, w.label))
    .map((w) => ({
      key: `warta-${w.id}`,
      grup: "Warta",
      judul: w.judul,
      keterangan: `${w.label} · ${w.tanggal}`,
      target: { type: "warta", id: w.id },
    }));

  return [pesanan, komoditas, kategori, transaksi, warta].flatMap((g) => g.slice(0, MAKS_PER_GRUP));
}
