import { describe, expect, it } from "vitest";
import { KOMODITAS_LIST } from "@/lib/data/komoditas";
import { PESANAN_LIST } from "@/lib/data/pesanan";
import { hitungKritis } from "@/lib/stok";
import { buatNotifikasi } from "@/lib/notifikasi";

describe("buatNotifikasi", () => {
  it("satu notifikasi per komoditas kritis, plus dikemas/kurir/pengumuman", () => {
    const hasil = buatNotifikasi({ pesanan: PESANAN_LIST, komoditas: KOMODITAS_LIST });
    expect(hasil.filter((n) => n.jenis === "stok-kritis")).toHaveLength(hitungKritis(KOMODITAS_LIST));
    expect(hasil.some((n) => n.jenis === "dikemas")).toBe(true);
    expect(hasil.some((n) => n.jenis === "kurir")).toBe(true);
    expect(hasil.some((n) => n.jenis === "pengumuman")).toBe(true);
  });
  it("tanpa pesanan perlu dikemas, notifikasi dikemas hilang", () => {
    const selesai = PESANAN_LIST.map((p) => ({ ...p, status: "selesai" as const }));
    expect(buatNotifikasi({ pesanan: selesai, komoditas: KOMODITAS_LIST }).some((n) => n.jenis === "dikemas")).toBe(false);
  });
  it("ada notifikasi komplain selama komplain menunggu keputusan penjual", () => {
    const hasil = buatNotifikasi({ pesanan: PESANAN_LIST, komoditas: KOMODITAS_LIST });
    expect(hasil.find((n) => n.jenis === "komplain")?.target).toEqual({ type: "pesanan", id: "PSD-20261024-0074" });
  });
  it("kunci notifikasi unik", () => {
    const keys = buatNotifikasi({ pesanan: PESANAN_LIST, komoditas: KOMODITAS_LIST }).map((n) => n.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("pesanan yang dibatalkan pembeli dalam 24 jam terakhir memunculkan notifikasi", () => {
    const sekarang = new Date("2026-10-24T12:00:00.000Z");
    const batal = PESANAN_LIST.map((p, i) =>
      i === 0 ? { ...p, status: "dibatalkan" as const, dibatalkanOleh: "pembeli" as const, alasanBatal: "Salah memilih produk", dibatalkanPada: "2026-10-24T08:00:00.000Z" } : p,
    );
    const n = buatNotifikasi({ pesanan: batal, komoditas: KOMODITAS_LIST, sekarang }).find((x) => x.jenis === "batal");
    expect(n?.judul).toBe("1 pesanan dibatalkan pembeli");
    expect(n?.keterangan).toContain("Salah memilih produk");
    // lewat 24 jam atau tanpa `sekarang` → tidak tampil
    expect(buatNotifikasi({ pesanan: batal, komoditas: KOMODITAS_LIST, sekarang: new Date("2026-10-26T12:00:00.000Z") }).some((x) => x.jenis === "batal")).toBe(false);
    expect(buatNotifikasi({ pesanan: batal, komoditas: KOMODITAS_LIST }).some((x) => x.jenis === "batal")).toBe(false);
  });

  it("tiket aduan yang masih diverifikasi memunculkan notifikasi dan membuka tiketnya", () => {
    const aduan = [{ idServer: 1, id: "ADU-1", topik: "Pengantaran / Kurir Desa", judul: "x", foto: [], status: "diverifikasi" as const, dibuatPada: "2026-10-24T07:00:00.000Z", pembeli: "Bu Lastri" }];
    const n = buatNotifikasi({ pesanan: PESANAN_LIST, komoditas: KOMODITAS_LIST, aduan }).find((x) => x.jenis === "aduan");
    expect(n?.judul).toBe("1 tiket aduan baru");
    expect(n?.target).toEqual({ type: "aduan", id: "ADU-1" });
    expect(buatNotifikasi({ pesanan: PESANAN_LIST, komoditas: KOMODITAS_LIST, aduan: [{ ...aduan[0], status: "selesai" as const }] }).some((x) => x.jenis === "aduan")).toBe(false);
  });
});
