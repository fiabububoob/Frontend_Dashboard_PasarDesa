"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { FotoGaleri } from "@/components/ui/FotoGaleri";
import { useToast } from "@/components/ui/Toast";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { useDetail } from "@/components/detail/DetailProvider";
import { useSekarang } from "@/lib/hooks/useSekarang";
import { LABEL_STATUS_ADUAN, lewatBatas } from "@/lib/aduanApi";
import { tanggalWib } from "@/lib/kasApi";
import { waLink } from "@/lib/format";
import type { StatusAduan } from "@/types";

const TONE: Record<StatusAduan, "warning" | "info" | "success"> = { diverifikasi: "warning", diproses: "info", selesai: "success" };
const waktu = (iso: string) => {
  const { tanggal, waktu: jam } = tanggalWib(iso);
  return `${tanggal}, ${jam}`;
};

// Detail satu tiket aduan: isi aduan, foto bukti, riwayat, dan balasan ke pembeli. Status hanya bisa maju
// (Sedang Diverifikasi → Diproses → Selesai); balasan tersimpan di server dan terlihat pembeli di aplikasi.
export function AduanDrawer({ id }: { id: string }) {
  const { aduan, ubahAduan, pesanan } = useDashboardData();
  const { close, push } = useDetail();
  const toast = useToast();
  const sekarang = useSekarang();
  const a = aduan.find((x) => x.id === id);
  const [balasan, setBalasan] = useState(a?.balasan ?? "");
  const [sibuk, setSibuk] = useState(false);

  if (!a) {
    return (
      <Drawer title="Tiket Aduan" onClose={close}>
        <p className="text-sm text-ink-500">Tiket tidak ditemukan.</p>
      </Drawer>
    );
  }

  const terkait = a.kodePesanan ? pesanan.find((p) => p.id === a.kodePesanan) : undefined;
  const telat = sekarang ? lewatBatas(a, sekarang) : false;

  async function kirim(perubahan: { status?: StatusAduan; balasan?: string }, pesanBerhasil: string) {
    setSibuk(true);
    try {
      await ubahAduan(id, perubahan);
      toast({ type: "success", title: pesanBerhasil, description: `Tiket ${id}` });
    } catch (e) {
      toast({ type: "error", title: "Gagal memperbarui aduan", description: e instanceof Error ? e.message : undefined });
    } finally {
      setSibuk(false);
    }
  }

  const balasanBerubah = balasan.trim() !== "" && balasan.trim() !== (a.balasan ?? "");

  return (
    <Drawer
      title={`#${a.id}`}
      subtitle={`${a.topik} · ${a.pembeli}`}
      badge={<Badge tone={TONE[a.status]}>{LABEL_STATUS_ADUAN[a.status]}</Badge>}
      onClose={close}
      footer={(tutup) => (
        <>
          <Button variant="secondary" className="border-brand-600 text-brand-700" onClick={tutup}>
            Tutup
          </Button>
          <div className="ml-auto flex items-center gap-3">
            {a.status === "diverifikasi" && (
              <Button variant="secondary" disabled={sibuk} onClick={() => kirim({ status: "diproses" }, "Aduan diproses")}>
                Tandai Diproses
              </Button>
            )}
            {a.status !== "selesai" && (
              <Button disabled={sibuk} onClick={() => kirim({ status: "selesai", ...(balasanBerubah ? { balasan: balasan.trim() } : {}) }, "Aduan selesai")}>
                Tandai Selesai
              </Button>
            )}
          </div>
        </>
      )}
    >
      <div className="space-y-6 text-sm">
        {telat && (
          <p role="alert" className="rounded-xl border border-danger-600/30 bg-danger-50 px-4 py-3 font-semibold text-danger-600">
            Lewat target tindak lanjut 1×24 jam. Segera tanggapi pembeli.
          </p>
        )}

        <section>
          <p className="text-base font-bold text-ink-900">{a.judul}</p>
          {a.deskripsi && <p className="mt-1.5 whitespace-pre-line text-ink-700">{a.deskripsi}</p>}
        </section>

        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-line p-3">
            <dt className="text-xs text-ink-500">Pembeli</dt>
            <dd className="font-semibold text-ink-900">{a.pembeli}</dd>
            {a.telepon ? (
              <a href={waLink(a.telepon, `Halo ${a.pembeli}, terkait aduan #${a.id} di PasarDesa Sukorejo.`)} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-brand-600 hover:underline">
                Hubungi via WhatsApp
              </a>
            ) : (
              <dd className="text-xs text-ink-400">{a.email ?? "Kontak tidak tersedia"}</dd>
            )}
          </div>
          <div className="rounded-xl border border-line p-3">
            <dt className="text-xs text-ink-500">Solusi yang diminta</dt>
            <dd className="font-semibold text-ink-900">{a.solusiDiminta ?? "Tidak dipilih"}</dd>
          </div>
          {a.kodePesanan && (
            <div className="rounded-xl border border-line p-3 sm:col-span-2">
              <dt className="text-xs text-ink-500">Pesanan terkait</dt>
              <dd>
                {terkait ? (
                  <button type="button" onClick={() => push({ type: "pesanan", id: terkait.id })} className="font-semibold text-brand-600 hover:underline">
                    #{terkait.id} · {terkait.pembeli}
                  </button>
                ) : (
                  <span className="font-semibold text-ink-900">#{a.kodePesanan}</span>
                )}
              </dd>
            </div>
          )}
        </dl>

        <section>
          <p className="mb-2 font-bold text-ink-900">Foto bukti ({a.foto.length})</p>
          {a.foto.length > 0 ? <FotoGaleri foto={a.foto} ukuran="h-24 w-24" alt="Foto bukti aduan" /> : <p className="text-xs text-ink-400">Pembeli tidak melampirkan foto.</p>}
        </section>

        <section>
          <p className="mb-2 font-bold text-ink-900">Riwayat</p>
          <ol className="space-y-1 text-xs text-ink-700">
            <li>{waktu(a.dibuatPada)} · Diajukan pembeli</li>
            {a.dibalasPada && <li>{waktu(a.dibalasPada)} · Dibalas admin</li>}
            {a.status === "selesai" && <li>Aduan selesai</li>}
          </ol>
        </section>

        <section>
          <label htmlFor="balasan-aduan" className="mb-1.5 block font-bold text-ink-900">
            Balasan ke pembeli
          </label>
          <textarea
            id="balasan-aduan"
            rows={3}
            maxLength={1000}
            value={balasan}
            disabled={a.status === "selesai"}
            onChange={(e) => setBalasan(e.target.value)}
            placeholder="Tulis tindak lanjut untuk pembeli…"
            className="w-full rounded-xl border border-line bg-white px-3.5 py-3 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-surface-muted"
          />
          {a.status !== "selesai" && (
            <Button className="mt-2" variant="secondary" size="sm" disabled={sibuk || !balasanBerubah} onClick={() => kirim({ balasan: balasan.trim(), ...(a.status === "diverifikasi" ? { status: "diproses" as const } : {}) }, "Balasan terkirim")}>
              Kirim Balasan
            </Button>
          )}
        </section>
      </div>
    </Drawer>
  );
}
