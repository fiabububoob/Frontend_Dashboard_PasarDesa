import { describe, expect, it } from "vitest";
import { KAS_REKENING } from "@/lib/data/kas";
import { PESANAN_LIST } from "@/lib/data/pesanan";
import { formatIdTransaksi, hitungEscrow, mutasiBelumFinal, pesananEscrow, transaksiPencairan, transaksiPenjualan } from "@/lib/kas";

describe("escrow", () => {
  it("hanya pesanan berbayar digital (QRIS/Saldo) yang sedang berjalan", () => {
    const escrow = pesananEscrow(PESANAN_LIST);
    expect(escrow.length).toBeGreaterThan(0);
    expect(escrow.every((p) => p.metodeBayar !== "COD" && ["perlu-dikemas", "siap-jemput", "diantar", "tiba-di-pos", "komplain"].includes(p.status))).toBe(true);
    expect(hitungEscrow(PESANAN_LIST)).toBe(escrow.reduce((sum, p) => sum + p.total, 0));
  });
  it("tidak menghitung pesanan belum bayar, dibatalkan, atau selesai", () => {
    const luar = PESANAN_LIST.filter((p) => ["menunggu-pembayaran", "dibatalkan", "selesai"].includes(p.status));
    const idEscrow = new Set(pesananEscrow(PESANAN_LIST).map((p) => p.id));
    expect(luar.some((p) => idEscrow.has(p.id))).toBe(false);
  });
});

describe("mutasiBelumFinal", () => {
  it("Diproses dan Menunggu Pengambilan belum final", () => {
    expect(mutasiBelumFinal("Diproses")).toBe(true);
    expect(mutasiBelumFinal("Menunggu Pengambilan")).toBe(true);
    expect(mutasiBelumFinal("Berhasil Masuk")).toBe(false);
  });
});

describe("pembentuk transaksi", () => {
  it("penjualan bernilai positif sebesar total pesanan", () => {
    const t = transaksiPenjualan(PESANAN_LIST[0]);
    expect(t.nominal).toBe(PESANAN_LIST[0].total);
    expect(t.kategori).toBe("Penjualan Lapak");
  });
  it("pencairan bank bernilai negatif dan berstatus Diproses", () => {
    const t = transaksiPencairan(100000, "bank", KAS_REKENING, 9000);
    expect(t.nominal).toBe(-100000);
    expect(t.status).toBe("Diproses");
    expect(t.referensi).toContain("KAS-SKR-9000");
  });
  it("pencairan tunai menunggu pengambilan", () => {
    expect(transaksiPencairan(50000, "tunai", KAS_REKENING, 9001).status).toBe("Menunggu Pengambilan");
  });
  it("id transaksi diberi nol di depan", () => {
    expect(formatIdTransaksi(7)).toBe("TRX-0007");
  });
});
