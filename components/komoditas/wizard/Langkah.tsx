"use client";

import { useMemo } from "react";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Chip } from "@/components/ui/Chip";
import { fieldClass } from "@/components/ui/formStyles";
import { FotoUploader } from "@/components/komoditas/FotoUploader";
import { SpesifikasiEditor } from "@/components/komoditas/SpesifikasiEditor";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { BADGE_PRODUK } from "@/lib/data/badgeProduk";
import { KATEGORI_INDUK } from "@/lib/data/kategori";
import {
  LABEL_JENIS_SUMBER,
  OPSI_AREA_ANTAR,
  OPSI_BATAS_KLAIM,
  OPSI_ESTIMASI,
  OPSI_GARANSI,
  OPSI_KETERSEDIAAN,
  OPSI_LOKASI_AMBIL,
  OPSI_SATUAN,
  isianSpesifikasi,
} from "@/lib/data/komoditasOpsi";
import { MAKS_DESKRIPSI, MAKS_SARAN_PENYIMPANAN } from "@/lib/constants";
import { MAKS_KEUNGGULAN, type DraftKomoditas, type ErrorDraft, type UpdateDraft } from "@/lib/komoditasForm";
import { IKON_BAWAAN, IKON_SUB_KATEGORI, indukDari, subDariInduk } from "@/lib/kategori";
import type { BadgeProduk } from "@/types";

interface LangkahProps {
  draft: DraftKomoditas;
  update: UpdateDraft;
  error: ErrorDraft;
}

const Grid = ({ children }: { children: React.ReactNode }) => <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">{children}</div>;
const Pilih = ({ children }: { children: string }) => <option value="">{children}</option>;

// Pilihan yang sudah tersimpan tetap tampil walau di luar daftar baku.
const denganNilai = (opsi: string[], nilai: string) => (nilai && !opsi.includes(nilai) ? [nilai, ...opsi] : opsi);

// ---------------------------------------------------------------------------
// 1. Info Dasar
// ---------------------------------------------------------------------------
export function LangkahInfoDasar({ draft, update }: LangkahProps) {
  const induk = indukDari(draft.kategori)?.nama ?? "";

  function pilihInduk(nama: string) {
    const sub = subDariInduk(nama)[0] ?? "";
    update(draft.ikonDipilihSendiri ? { kategori: sub } : { kategori: sub, gambar: IKON_SUB_KATEGORI[sub] ?? IKON_BAWAAN });
  }
  function pilihSub(sub: string) {
    update(draft.ikonDipilihSendiri ? { kategori: sub } : { kategori: sub, gambar: IKON_SUB_KATEGORI[sub] ?? IKON_BAWAAN });
  }
  const toggleBadge = (kode: BadgeProduk) => {
    const berikut = draft.badge.includes(kode) ? draft.badge.filter((k) => k !== kode) : [...draft.badge, kode];
    update({ badge: BADGE_PRODUK.map((b) => b.kode).filter((k) => berikut.includes(k)) });
  };

  return (
    <div className="space-y-5">
      <Field label="Nama komoditas" htmlFor="kmd-nama" required hint="Maks. 80 karakter">
        <Input id="kmd-nama" required minLength={3} maxLength={80} value={draft.nama} onChange={(e) => update({ nama: e.target.value })} placeholder="Contoh: Beras Pandan Wangi Sukorejo 5kg" />
      </Field>

      <Grid>
        <Field label="Kategori utama" htmlFor="kmd-induk" required>
          <Select id="kmd-induk" required value={induk} onChange={(e) => pilihInduk(e.target.value)}>
            <Pilih>Pilih kategori</Pilih>
            {KATEGORI_INDUK.map((k) => (
              <option key={k.id} value={k.nama}>
                {k.nama}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Subkategori" htmlFor="kmd-sub" required hint="Menyesuaikan kategori">
          <Select id="kmd-sub" required disabled={!induk} value={draft.kategori} onChange={(e) => pilihSub(e.target.value)}>
            <Pilih>Pilih subkategori</Pilih>
            {subDariInduk(induk).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
      </Grid>

      <div>
        <p className="mb-1.5 text-sm font-semibold text-ink-900">
          Jenis sumber <span className="text-danger-600">*</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {LABEL_JENIS_SUMBER.map((s) => (
            <Chip key={s} selected={draft.sumber === s} onClick={() => update({ sumber: s })}>
              {s}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-sm font-semibold text-ink-900">Label tampilan (opsional)</p>
        <div className="flex flex-wrap gap-2">
          {BADGE_PRODUK.map((b) => (
            <Chip key={b.kode} selected={draft.badge.includes(b.kode)} onClick={() => toggleBadge(b.kode)}>
              {b.label}
            </Chip>
          ))}
        </div>
      </div>

      <FotoUploader foto={draft.foto} onChange={(foto) => update({ foto })} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. Harga & Stok
// ---------------------------------------------------------------------------
export function LangkahHargaStok({ draft, update, error }: LangkahProps) {
  // Form menampilkan "harga normal" + "harga diskon"; data menyimpan harga jual + harga coret.
  const adaDiskon = draft.hargaCoret !== "";
  const normal = adaDiskon ? draft.hargaCoret : draft.harga;
  const diskon = adaDiskon ? draft.harga : "";
  const persen = adaDiskon && Number(normal) > 0 && Number(diskon) < Number(normal) ? Math.round((1 - Number(diskon) / Number(normal)) * 100) : 0;

  const setNormal = (v: string) => update(adaDiskon ? { hargaCoret: v } : { harga: v });
  const setDiskon = (v: string) => update(v === "" ? { harga: normal, hargaCoret: "" } : { harga: v, hargaCoret: normal });

  return (
    <Grid>
      <Field label="Harga normal (Rp)" htmlFor="kmd-harga" required>
        <Input id="kmd-harga" type="number" inputMode="numeric" min={100} step={100} required placeholder="0" value={normal} onChange={(e) => setNormal(e.target.value)} />
      </Field>
      <Field label="Satuan jual" htmlFor="kmd-satuan" required>
        <Select id="kmd-satuan" required value={draft.satuan} onChange={(e) => update({ satuan: e.target.value })}>
          <Pilih>Pilih satuan</Pilih>
          {denganNilai(OPSI_SATUAN, draft.satuan).map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>
      </Field>
      <Field label="Isi per satuan" htmlFor="kmd-ukuran">
        <Input id="kmd-ukuran" value={draft.ukuran} onChange={(e) => update({ ukuran: e.target.value })} placeholder="Contoh: 1 sak = 5 kg" />
      </Field>
      <Field label="Harga diskon (Rp)" htmlFor="kmd-diskon" hint={persen > 0 ? `Diskon ${persen}% dihitung otomatis` : "Persen dihitung otomatis"}>
        <Input id="kmd-diskon" type="number" inputMode="numeric" min={100} step={100} placeholder="Opsional" value={diskon} error={error.hargaCoret} onChange={(e) => setDiskon(e.target.value)} />
      </Field>
      <Field label="Stok awal" htmlFor="kmd-stok" required>
        <Input id="kmd-stok" type="number" inputMode="numeric" min={0} step={1} required placeholder="0" value={draft.stok} error={error.stok} onChange={(e) => update({ stok: e.target.value })} />
      </Field>
      <Field label="Kapasitas stok maks." htmlFor="kmd-maks" required hint={draft.satuan ? `Dalam ${draft.satuan}` : undefined}>
        <Input id="kmd-maks" type="number" inputMode="numeric" min={1} step={1} required placeholder="Contoh: 50" value={draft.stokMaks} onChange={(e) => update({ stokMaks: e.target.value })} />
      </Field>
      <Field label="Batas stok rendah" htmlFor="kmd-batas" required>
        <Input id="kmd-batas" type="number" inputMode="numeric" min={0} step={1} required placeholder="10" value={draft.batasStokRendah} onChange={(e) => update({ batasStokRendah: e.target.value })} />
      </Field>
      <Field label="Status ketersediaan" htmlFor="kmd-ketersediaan" required>
        <Select id="kmd-ketersediaan" required value={draft.ketersediaan} onChange={(e) => update({ ketersediaan: e.target.value })}>
          <Pilih>Pilih status</Pilih>
          {denganNilai(OPSI_KETERSEDIAAN, draft.ketersediaan).map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>
      </Field>
      <Field label="Minimal beli" htmlFor="kmd-min">
        <Input id="kmd-min" type="number" inputMode="numeric" min={1} step={1} placeholder="1" value={draft.minBeli} onChange={(e) => update({ minBeli: e.target.value })} />
      </Field>
      <Field label="Maksimal beli per transaksi" htmlFor="kmd-maksbeli">
        <Input id="kmd-maksbeli" type="number" inputMode="numeric" min={1} step={1} placeholder="Contoh: 10" value={draft.maksBeli} onChange={(e) => update({ maksBeli: e.target.value })} />
      </Field>
    </Grid>
  );
}

// ---------------------------------------------------------------------------
// 3. Penjual & Konten
// ---------------------------------------------------------------------------
export function LangkahPenjual({ draft, update }: LangkahProps) {
  const { komoditas } = useDashboardData();
  const daftarPenjual = useMemo(() => Array.from(new Set(komoditas.map((k) => k.penjual ?? k.asalBlok))), [komoditas]);

  return (
    <div className="space-y-5">
      <Field label="Nama penjual" htmlFor="kmd-penjual" required>
        <Select id="kmd-penjual" required value={draft.penjual} onChange={(e) => update({ penjual: e.target.value })}>
          <Pilih>Pilih penjual</Pilih>
          {denganNilai(daftarPenjual, draft.penjual).map((p) => (
            <option key={p}>{p}</option>
          ))}
        </Select>
      </Field>
      <p className="rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-2.5 text-sm text-brand-900">Alamat dan status verifikasi terisi otomatis dari data penjual.</p>

      <Field label="Deskripsi singkat" htmlFor="kmd-deskripsi" required hint="Maks. 160 karakter">
        <Input id="kmd-deskripsi" required maxLength={160} value={draft.deskripsi} onChange={(e) => update({ deskripsi: e.target.value.slice(0, MAKS_DESKRIPSI) })} placeholder="Tampil di kartu produk" />
      </Field>
      <Field label="Keunggulan" htmlFor="kmd-keunggulan" hint={`Maks. ${MAKS_KEUNGGULAN} poin`}>
        <textarea
          id="kmd-keunggulan"
          rows={4}
          value={draft.keunggulan}
          onChange={(e) => update({ keunggulan: e.target.value.split("\n").slice(0, MAKS_KEUNGGULAN).join("\n") })}
          placeholder="Satu poin per baris. Format: Judul: isi"
          className={fieldClass()}
        />
      </Field>
      <Field label="Saran penyimpanan" htmlFor="kmd-saran">
        <textarea
          id="kmd-saran"
          rows={3}
          maxLength={MAKS_SARAN_PENYIMPANAN}
          value={draft.saranPenyimpanan}
          onChange={(e) => update({ saranPenyimpanan: e.target.value })}
          placeholder="Contoh: Simpan di wadah kedap udara agar aroma wangi tahan hingga 3 bulan"
          className={fieldClass()}
        />
      </Field>
      <Field label="Garansi mutu" htmlFor="kmd-garansi">
        <Select id="kmd-garansi" value={draft.garansiMutu} onChange={(e) => update({ garansiMutu: e.target.value })}>
          <Pilih>Pilih template</Pilih>
          {denganNilai(OPSI_GARANSI, draft.garansiMutu).map((g) => (
            <option key={g}>{g}</option>
          ))}
        </Select>
      </Field>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. Spesifikasi (menyesuaikan kategori utama)
// ---------------------------------------------------------------------------
export function LangkahSpesifikasi({ draft, update }: LangkahProps) {
  const induk = indukDari(draft.kategori)?.nama ?? "";
  const isian = isianSpesifikasi(induk);
  const labelBaku = isian.flatMap((i) => [i.label, ...(i.alias ?? [])]);
  const cocok = (label: string, i: (typeof isian)[number]) => label === i.label || (i.alias ?? []).includes(label);
  const nilaiDari = (i: (typeof isian)[number]) => draft.spesifikasi.find((s) => cocok(s.label, i))?.nilai ?? "";

  function ubah(i: (typeof isian)[number], nilai: string) {
    const lain = draft.spesifikasi.filter((s) => !cocok(s.label, i));
    update({ spesifikasi: nilai === "" ? lain : [...lain, { label: i.label, nilai }] });
  }
  const tambahan = draft.spesifikasi.filter((s) => !labelBaku.includes(s.label));

  return (
    <div className="space-y-5">
      <p className="rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-2.5 text-sm text-brand-900">
        Field spesifikasi menyesuaikan kategori{induk ? `: ${induk}` : ""}.
      </p>
      <Grid>
        {isian.slice(0, 2).map((i, n) => (
          <Field key={i.label} label={i.label} htmlFor={`kmd-spek-${n}`} required={i.wajib}>
            <Input id={`kmd-spek-${n}`} required={i.wajib} value={nilaiDari(i)} onChange={(e) => ubah(i, e.target.value)} placeholder={i.placeholder} />
          </Field>
        ))}
        <Field label="Tanggal giling / petik" htmlFor="kmd-panen">
          <Input id="kmd-panen" type="date" value={draft.tanggalPanen} onChange={(e) => update({ tanggalPanen: e.target.value })} />
        </Field>
        {isian.slice(2).map((i, n) => (
          <Field key={i.label} label={i.label} htmlFor={`kmd-spek-${n + 2}`}>
            <Input id={`kmd-spek-${n + 2}`} value={nilaiDari(i)} onChange={(e) => ubah(i, e.target.value)} placeholder={i.placeholder} />
          </Field>
        ))}
      </Grid>
      <SpesifikasiEditor nilai={tambahan} onChange={(lain) => update({ spesifikasi: [...draft.spesifikasi.filter((s) => labelBaku.includes(s.label)), ...lain] })} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 5. Pengiriman & kebijakan
// ---------------------------------------------------------------------------
export function LangkahPengiriman({ draft, update, error }: LangkahProps) {
  return (
    <div className="space-y-5">
      <div>
        <p className="mb-1.5 text-sm font-semibold text-ink-900">
          Opsi pengiriman <span className="text-danger-600">*</span>
        </p>
        <div className="flex flex-wrap gap-2">
          <Chip selected={draft.antarKurir} onClick={() => update({ antarKurir: !draft.antarKurir })}>
            Antar kurir BUMDes
          </Chip>
          <Chip selected={draft.ambilDiKantor} onClick={() => update({ ambilDiKantor: !draft.ambilDiKantor })}>
            Ambil di kantor BUMDes
          </Chip>
        </div>
        {error.pengiriman && (
          <p role="alert" className="mt-1.5 text-xs text-danger-600">
            {error.pengiriman}
          </p>
        )}
      </div>

      <Grid>
        <Field label="Area antar" htmlFor="kmd-area">
          <Select id="kmd-area" value={draft.areaAntar} onChange={(e) => update({ areaAntar: e.target.value })}>
            <Pilih>Pilih RT/RW</Pilih>
            {denganNilai(OPSI_AREA_ANTAR, draft.areaAntar).map((o) => (
              <option key={o}>{o}</option>
            ))}
          </Select>
        </Field>
        <Field label="Ongkir (Rp)" htmlFor="kmd-ongkir">
          <Input id="kmd-ongkir" type="number" inputMode="numeric" min={0} step={500} placeholder="0 = gratis" value={draft.ongkir} onChange={(e) => update({ ongkir: e.target.value })} />
        </Field>
        <Field label="Estimasi sampai" htmlFor="kmd-estimasi">
          <Select id="kmd-estimasi" value={draft.estimasi} onChange={(e) => update({ estimasi: e.target.value })}>
            <Pilih>Pilih estimasi</Pilih>
            {denganNilai(OPSI_ESTIMASI, draft.estimasi).map((o) => (
              <option key={o}>{o}</option>
            ))}
          </Select>
        </Field>
        <Field label="Jam order terakhir" htmlFor="kmd-jam">
          <Input id="kmd-jam" type="time" value={draft.jamOrderTerakhir} onChange={(e) => update({ jamOrderTerakhir: e.target.value })} />
        </Field>
        <Field label="Lokasi ambil" htmlFor="kmd-lokasi">
          <Select id="kmd-lokasi" value={draft.lokasiAmbil} onChange={(e) => update({ lokasiAmbil: e.target.value })}>
            <Pilih>Pilih lokasi</Pilih>
            {denganNilai(OPSI_LOKASI_AMBIL, draft.lokasiAmbil).map((o) => (
              <option key={o}>{o}</option>
            ))}
          </Select>
        </Field>
        <Field label="Berat kirim (kg)" htmlFor="kmd-berat">
          <Input id="kmd-berat" type="number" inputMode="decimal" min={0} step={0.1} placeholder="0" value={draft.beratKirimKg} onChange={(e) => update({ beratKirimKg: e.target.value })} />
        </Field>
      </Grid>

      <div>
        <p className="mb-1.5 text-sm font-semibold text-ink-900">
          Bisa diklaim / diretur <span className="text-danger-600">*</span>
        </p>
        <div className="flex gap-2">
          <Chip selected={draft.bisaDiklaim} onClick={() => update({ bisaDiklaim: true })}>
            Ya
          </Chip>
          <Chip selected={!draft.bisaDiklaim} onClick={() => update({ bisaDiklaim: false })}>
            Tidak
          </Chip>
        </div>
      </div>

      <Grid>
        <Field label="Batas waktu klaim" htmlFor="kmd-klaim">
          <Select id="kmd-klaim" disabled={!draft.bisaDiklaim} value={draft.batasKlaim} onChange={(e) => update({ batasKlaim: e.target.value })}>
            <Pilih>Pilih batas</Pilih>
            {denganNilai(OPSI_BATAS_KLAIM, draft.batasKlaim).map((o) => (
              <option key={o}>{o}</option>
            ))}
          </Select>
        </Field>
        <Field label="Catatan kebijakan" htmlFor="kmd-catatan">
          <Input id="kmd-catatan" value={draft.catatanKebijakan} onChange={(e) => update({ catatanKebijakan: e.target.value })} placeholder="Opsional" />
        </Field>
      </Grid>
    </div>
  );
}
