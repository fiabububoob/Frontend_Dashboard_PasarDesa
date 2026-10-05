import { describe, expect, it } from "vitest";
import { KOMODITAS_LIST } from "@/lib/data/komoditas";
import { PESANAN_LIST } from "@/lib/data/pesanan";
import { hitungStatus } from "@/lib/pesanan";
import { statKas, statKomoditas, statPesanan, statRingkasan } from "@/lib/stats";

const nilai = (stats: { id: string; value: string }[], id: string) => stats.find((s) => s.id === id)?.value;

describe("statPesanan", () => {
  it("angka antrean mengikuti jumlah pesanan perlu dikemas", () => {
    const stats = statPesanan(PESANAN_LIST);
    expect(nilai(stats, "antrean")).toBe(`${hitungStatus(PESANAN_LIST, "perlu-dikemas")} Paket`);
    expect(stats.find((s) => s.id === "perputaran")?.helper).toBe(`${PESANAN_LIST.length} Transaksi total`);
  });
});

describe("statKomoditas", () => {
  it("jumlah aktif + disembunyikan = total komoditas", () => {
    const sembunyi = KOMODITAS_LIST.filter((k) => !k.tampil).length;
    const stats = statKomoditas(KOMODITAS_LIST);
    expect(Number(nilai(stats, "aktif")) + sembunyi).toBe(KOMODITAS_LIST.length);
  });
});

describe("statRingkasan", () => {
  it("memuat empat kartu dengan saldo & omset dari argumen", () => {
    const stats = statRingkasan({ komoditas: KOMODITAS_LIST, pesanan: PESANAN_LIST, saldoAktif: 1000000, omset: 2000000 });
    expect(stats).toHaveLength(4);
    expect(nilai(stats, "saldo")).toBe("Rp 1.000.000");
    expect(nilai(stats, "penjualan")).toBe("Rp 2.000.000");
  });
});

describe("statKas", () => {
  it("menampilkan saldo aktif dan jumlah pesanan berjalan di escrow", () => {
    const stats = statKas({ pesanan: PESANAN_LIST, saldoAktif: 500000, omset: 900000 });
    expect(nilai(stats, "saldo-aktif")).toBe("Rp 500.000");
    expect(stats.find((s) => s.id === "saldo-escrow")?.helper).toMatch(/pesanan berjalan/);
  });
});
