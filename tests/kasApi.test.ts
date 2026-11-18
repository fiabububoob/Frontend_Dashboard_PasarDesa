import { describe, expect, it } from "vitest";
import { mutasiDariApi, type BarisKasApi } from "@/lib/kasApi";

const dasar: BarisKasApi = { id: 12, type: "credit", category: "penjualan", description: "Penjualan pesanan PSD-1", amount: "136000.00", referenceCode: "PESANAN-1", createdAt: "2026-10-24T07:20:00.000Z" };

describe("mutasiDariApi", () => {
  it("penjualan masuk: nominal positif, tanggal & jam WIB", () => {
    const m = mutasiDariApi(dasar);
    expect(m).toMatchObject({ id: "TRX-12", kategori: "Penjualan Lapak", nominal: 136000, status: "Berhasil Masuk", referensi: "PESANAN-1" });
    expect(m.tanggal).toContain("2026");
    expect(m.waktu).toBe("14:20 WIB"); // 07:20 UTC = 14:20 WIB
  });

  it("pencairan: nominal negatif; jalur tunai dibedakan dari transfer", () => {
    const bank = mutasiDariApi({ ...dasar, type: "debit", category: "pencairan", description: "Pencairan Dana Kas (Transfer Bank)" });
    const tunai = mutasiDariApi({ ...dasar, type: "debit", category: "pencairan", description: "Pencairan Dana Kas (Tunai di Balai Desa)" });
    expect(bank).toMatchObject({ kategori: "Pencairan Kas", nominal: -136000, status: "Berhasil Ditransfer" });
    expect(tunai.status).toBe("Berhasil Dicairkan");
  });

  it("debit kategori penjualan = koreksi pembatalan; kredit lain = subsidi desa", () => {
    expect(mutasiDariApi({ ...dasar, type: "debit" })).toMatchObject({ kategori: "Penjualan Lapak", status: "Dikoreksi", nominal: -136000 });
    expect(mutasiDariApi({ ...dasar, category: "subsidi" })).toMatchObject({ kategori: "Subsidi Desa", status: "Berhasil Disubsidi" });
  });

  it("referensi kosong tampil sebagai strip", () => {
    expect(mutasiDariApi({ ...dasar, referenceCode: null }).referensi).toBe("-");
  });
});
