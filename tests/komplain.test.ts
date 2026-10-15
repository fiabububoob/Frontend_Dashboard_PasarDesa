import { describe, expect, it } from "vitest";
import { PESANAN_LIST } from "@/lib/data/pesanan";
import { hitungEscrow, transaksiPenjualan } from "@/lib/kas";
import { ajukanKomplainPada, bisaDikomplain, buatKomplainContoh, nilaiBersih, nilaiRefund, nilaiRefundPilihan, teruskanKeBumdes, terapkanPenyelesaian } from "@/lib/komplain";
import type { Pesanan } from "@/types";

const SEKARANG = new Date("2023-10-24T10:00:00Z");
const komplainAwal = PESANAN_LIST.find((p) => p.status === "komplain")!;
const tibaDiPos = PESANAN_LIST.find((p) => p.status === "tiba-di-pos")!;

describe("bisaDikomplain (keputusan D8)", () => {
  it("hanya saat tiba di pos dan belum pernah dikomplain", () => {
    expect(bisaDikomplain(tibaDiPos)).toBe(true);
    expect(bisaDikomplain({ ...tibaDiPos, komplain: komplainAwal.komplain })).toBe(false);
    expect(bisaDikomplain({ status: "diantar", komplain: undefined })).toBe(false);
    expect(bisaDikomplain({ status: "selesai", komplain: undefined })).toBe(false);
  });
});

describe("ajukanKomplainPada & buatKomplainContoh", () => {
  it("mengubah status menjadi komplain dan menyimpan komplain", () => {
    const hasil = ajukanKomplainPada(tibaDiPos, buatKomplainContoh(tibaDiPos, SEKARANG, 7));
    expect(hasil.status).toBe("komplain");
    expect(hasil.komplain?.id).toBe("KMP-0007");
    expect(hasil.komplain?.items).toHaveLength(tibaDiPos.items.length);
  });
  it("tidak mengubah pesanan yang belum boleh dikomplain", () => {
    const belum = PESANAN_LIST.find((p) => p.status === "perlu-dikemas")!;
    expect(ajukanKomplainPada(belum, buatKomplainContoh(belum, SEKARANG, 1))).toBe(belum);
  });
});

describe("terapkanPenyelesaian (keputusan D9)", () => {
  it("semua refund → selesai, tanpa kirim ulang", () => {
    const hasil = terapkanPenyelesaian(komplainAwal, ["refund", "refund"]);
    expect(hasil.status).toBe("selesai");
    expect(hasil.kirimUlang).toBeUndefined();
    expect(hasil.komplain?.status).toBe("selesai");
    expect(nilaiRefund(hasil)).toBe(92000);
    expect(nilaiBersih(hasil)).toBe(0);
  });
  it("ada item pengganti → kembali ke antrean kemas sebagai kirim ulang", () => {
    const hasil = terapkanPenyelesaian(komplainAwal, ["refund", "pengganti"]);
    expect(hasil.status).toBe("perlu-dikemas");
    expect(hasil.kirimUlang).toBe(true);
    expect(nilaiRefund(hasil)).toBe(68000);
    expect(nilaiBersih(hasil)).toBe(24000); // jagung pengganti tetap hak penjual
  });
  it("pilihan belum lengkap tidak mengubah apa pun", () => {
    expect(terapkanPenyelesaian(komplainAwal, ["refund", undefined])).toBe(komplainAwal);
    expect(terapkanPenyelesaian(komplainAwal, ["refund"])).toBe(komplainAwal);
  });
  it("komplain yang sudah selesai tidak bisa diputuskan lagi", () => {
    const selesai = terapkanPenyelesaian(komplainAwal, ["refund", "refund"]);
    expect(terapkanPenyelesaian(selesai, ["pengganti", "pengganti"])).toBe(selesai);
  });
});

describe("teruskanKeBumdes", () => {
  it("menandai komplain diteruskan; status pesanan tetap komplain (dana ditahan)", () => {
    const hasil = teruskanKeBumdes(komplainAwal);
    expect(hasil.komplain?.status).toBe("diteruskan-bumdes");
    expect(hasil.status).toBe("komplain");
  });
  it("BUMDes masih bisa memutuskan kasus yang diteruskan", () => {
    const hasil = terapkanPenyelesaian(teruskanKeBumdes(komplainAwal), ["refund", "refund"]);
    expect(hasil.status).toBe("selesai");
  });
});

describe("nilai bersih & kas", () => {
  it("nilaiRefundPilihan menghitung dari pilihan yang belum disimpan", () => {
    expect(nilaiRefundPilihan(komplainAwal.komplain!, ["refund", "pengganti"])).toBe(68000);
    expect(nilaiRefundPilihan(komplainAwal.komplain!, [undefined, undefined])).toBe(0);
  });
  it("pesanan tanpa komplain: nilai bersih = total", () => {
    expect(nilaiBersih(tibaDiPos)).toBe(tibaDiPos.total);
  });
  it("escrow memuat pesanan komplain dengan nilai penuh sampai diputuskan", () => {
    const hanya: Pesanan[] = [komplainAwal];
    expect(hitungEscrow(hanya)).toBe(komplainAwal.total);
    expect(hitungEscrow([terapkanPenyelesaian(komplainAwal, ["refund", "pengganti"])])).toBe(24000);
  });
  it("transaksi penjualan memakai nilai bersih dan menyebut refund", () => {
    const sebagian = { ...terapkanPenyelesaian(komplainAwal, ["refund", "pengganti"]), status: "selesai" as const };
    const trx = transaksiPenjualan(sebagian);
    expect(trx.nominal).toBe(24000);
    expect(trx.referensi).toContain("setelah refund");
  });
});
