"use client";

import { useMemo, useState } from "react";
import { MessageSquareOff } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Bintang } from "@/components/ui/Bintang";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterPills } from "@/components/ui/FilterPills";
import { FotoGaleri } from "@/components/ui/FotoGaleri";
import { Pagination } from "@/components/ui/Pagination";
import { Select } from "@/components/ui/Select";
import { StatCardGrid } from "@/components/ui/StatCardGrid";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { usePaginasi } from "@/lib/hooks/usePaginasi";
import { tanggalWib } from "@/lib/kasApi";
import { bacaTags, formatRating } from "@/lib/ulasanApi";

const UKURAN = 6;
const FILTER = ["Semua", "Dengan foto", "Bintang 5", "Bintang 1–3"] as const;

// Ulasan & rating pembeli. Pembeli menilai tiap komoditas pada pesanan yang selesai dan boleh melampirkan foto
// (dari aplikasi mobile). Data dimuat dari server lewat DashboardDataProvider (juga dipakai widget di Ringkasan).
export function UlasanWorkspace() {
  const { ulasan: data, statusUlasan, galatUlasan, muatUlasan } = useDashboardData();
  const [filter, setFilter] = useState<string>("Semua");
  const [komoditas, setKomoditas] = useState("");

  const daftar = useMemo(
    () =>
      (data?.ulasan ?? []).filter((u) => {
        if (komoditas && !u.items.some((i) => i.komoditas === komoditas)) return false;
        if (filter === "Dengan foto") return daftarFotoAda(u.foto);
        if (filter === "Bintang 5") return u.rating === 5;
        if (filter === "Bintang 1–3") return u.rating <= 3;
        return true;
      }),
    [data, filter, komoditas],
  );
  const { halaman, totalHalaman, itemHalaman: tampil, setHalaman } = usePaginasi(daftar, `${filter}|${komoditas}`, UKURAN);

  const ringkasan = data?.ringkasan;
  const persen5 = ringkasan && ringkasan.total > 0 ? Math.round((ringkasan.distribusi["5"] / ringkasan.total) * 100) : 0;

  return (
    <>
      <PageHeader
        eyebrow="Ulasan"
        title="Ulasan & Rating"
        description="Penilaian pembeli setelah pesanan selesai, per komoditas, lengkap dengan foto dari pembeli."
      />

      {statusUlasan === "gagal" && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warn-400/40 bg-[#FFF6DB] px-4 py-3 text-sm text-[#7A4B00]">
          <p>
            <span className="font-semibold">Ulasan belum tersambung ke server.</span> {galatUlasan ?? ""}
          </p>
          <Button variant="secondary" size="sm" onClick={() => void muatUlasan()}>
            Coba lagi
          </Button>
        </div>
      )}

      <StatCardGrid
        columns={4}
        stats={[
          { id: "rata", label: "Rating Rata-rata", value: ringkasan && ringkasan.total > 0 ? `${formatRating(ringkasan.rataRata)} / 5` : "-", helper: ringkasan && ringkasan.total > 0 ? "Dari semua ulasan" : "Belum ada ulasan" },
          { id: "total", label: "Total Ulasan", value: String(ringkasan?.total ?? 0), helper: "Satu ulasan per pesanan" },
          { id: "foto", label: "Ulasan dengan Foto", value: String(ringkasan?.denganFoto ?? 0), helper: ringkasan?.total ? `${Math.round((ringkasan.denganFoto / ringkasan.total) * 100)}% dari semua ulasan` : "Belum ada foto" },
          { id: "bintang5", label: "Ulasan Bintang 5", value: `${persen5}%`, helper: `${ringkasan?.distribusi["5"] ?? 0} dari ${ringkasan?.total ?? 0} ulasan` },
        ]}
      />

      {!data || data.ringkasan.total === 0 ? (
        <Card>
          <EmptyState
            icon={MessageSquareOff}
            title={statusUlasan === "memuat" ? "Memuat ulasan…" : "Belum ada ulasan"}
            description="Ulasan muncul setelah pembeli menilai pesanan yang sudah selesai di aplikasi."
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="p-6">
              <h3 className="font-display text-lg font-bold text-ink-900">Sebaran Rating</h3>
              <ul className="mt-4 space-y-2.5">
                {(["5", "4", "3", "2", "1"] as const).map((n) => {
                  const jumlah = data.ringkasan.distribusi[n];
                  return (
                    <li key={n} className="flex items-center gap-3 text-sm">
                      <span className="w-12 shrink-0 font-semibold text-ink-700">{n} ★</span>
                      <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
                        <span className="block h-full rounded-full bg-[#F5A623]" style={{ width: `${(jumlah / data.ringkasan.total) * 100}%` }} />
                      </span>
                      <span className="w-8 shrink-0 text-right tabular-nums text-ink-500">{jumlah}</span>
                    </li>
                  );
                })}
              </ul>
            </Card>

            <Card className="overflow-hidden p-0">
              <h3 className="px-6 pb-3 pt-6 font-display text-lg font-bold text-ink-900">Rating per Komoditas</h3>
              <div className="max-h-[260px] overflow-y-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-y border-line bg-surface-muted text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                      <th className="px-6 py-2.5">Komoditas</th>
                      <th className="px-3 py-2.5">Rating</th>
                      <th className="px-3 py-2.5 text-right">Ulasan</th>
                      <th className="px-6 py-2.5 text-right">Berfoto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {data.perProduk.map((p) => (
                      <tr key={`${p.productId}-${p.nama}`}>
                        <td className="px-6 py-3 font-semibold text-ink-900">{p.nama}</td>
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-2">
                            <Bintang nilai={p.rataRata} ukuran="h-3.5 w-3.5" />
                            <span className="font-bold text-ink-900">{formatRating(p.rataRata)}</span>
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums text-ink-500">{p.jumlah}</td>
                        <td className="px-6 py-3 text-right tabular-nums text-ink-500">{p.denganFoto}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <Card className="overflow-hidden p-0">
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 pb-4 pt-6">
              <h3 className="font-display text-lg font-bold text-ink-900">Ulasan Terbaru</h3>
              <div className="flex flex-wrap items-center gap-3">
                <FilterPills options={FILTER.map((f) => ({ label: f }))} active={filter} onChange={setFilter} />
                <Select aria-label="Filter komoditas" className="w-auto min-w-[10rem]" value={komoditas} onChange={(e) => setKomoditas(e.target.value)}>
                  <option value="">Semua Komoditas</option>
                  {data.perProduk.map((p) => (
                    <option key={p.nama}>{p.nama}</option>
                  ))}
                </Select>
              </div>
            </div>

            {daftar.length === 0 ? (
              <EmptyState icon={MessageSquareOff} title="Tidak ada ulasan yang cocok" description="Ubah filter untuk melihat ulasan lain." />
            ) : (
              <ul className="divide-y divide-line border-t border-line">
                {tampil.map((u) => {
                  const { tanggal, waktu } = tanggalWib(u.dibuatPada);
                  const tags = bacaTags(u.tags);
                  const foto = Array.isArray(u.foto) ? u.foto : [];
                  return (
                    <li key={u.id} className="px-6 py-4 text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-bold text-ink-900">
                          {u.pembeli} <span className="font-normal text-ink-500">· #{u.kode}</span>
                        </p>
                        <p className="text-xs text-ink-500">
                          {tanggal}, {waktu}
                        </p>
                      </div>
                      <ul className="mt-2 space-y-1">
                        {u.items.map((i) => (
                          <li key={i.komoditas} className="flex items-center gap-2">
                            <Bintang nilai={i.rating} ukuran="h-3.5 w-3.5" />
                            <span className="text-ink-700">{i.komoditas}</span>
                          </li>
                        ))}
                      </ul>
                      {tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {tags.map((t) => (
                            <span key={t} className="rounded-full border border-brand-200 bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                      {u.note && <p className="mt-2 text-ink-700">&ldquo;{u.note}&rdquo;</p>}
                      {foto.length > 0 && (
                        <div className="mt-3">
                          <FotoGaleri foto={foto} ukuran="h-20 w-20" alt="Foto ulasan" />
                        </div>
                      )}
                      {u.courierLiked && <p className="mt-2 text-xs text-ink-500">Kurir disukai pembeli</p>}
                    </li>
                  );
                })}
              </ul>
            )}

            <Pagination showing={tampil.length} total={daftar.length} currentPage={halaman} totalPages={totalHalaman} itemLabel="ulasan" pageSize={UKURAN} onPageChange={setHalaman} />
          </Card>
        </>
      )}
    </>
  );
}

const daftarFotoAda = (foto: string[] | string | null): boolean => Array.isArray(foto) && foto.length > 0;
