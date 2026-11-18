import { describe, expect, it } from "vitest";
import { PESANAN_LIST, PESANAN_TABS } from "@/lib/data/pesanan";
import {
  butuhKurir,
  jatuhTempoPelepasan,
  labelPembayaran,
  langkahBerikutnya,
  perluDijemput,
  pesananDiTab,
  pesananJatuhTempo,
  sisaWaktuPelepasan,
  sudahLunas,
  terapkanStatus,
} from "@/lib/pesanan";
import type { Pesanan } from "@/types";

const KURIR = { opsiPengiriman: "kurir-desa" as const };
const MANDIRI = { opsiPengiriman: "ambil-mandiri" as const };
const dasar = PESANAN_LIST[0];
const SEKARANG = new Date("2023-10-24T10:00:00Z");

describe("langkahBerikutnya (siapa mengubah apa — keputusan D4)", () => {
  it("sistem mengonfirmasi setelah pembayaran", () => {
    expect(langkahBerikutnya({ status: "menunggu-pembayaran", ...KURIR })).toEqual({ ke: "perlu-dikemas", oleh: "sistem" });
  });
  it("penjual: siap jemput → diantar → tiba di pos", () => {
    expect(langkahBerikutnya({ status: "perlu-dikemas", ...KURIR })).toEqual({ ke: "siap-jemput", oleh: "penjual" });
    expect(langkahBerikutnya({ status: "siap-jemput", ...KURIR })).toEqual({ ke: "diantar", oleh: "penjual" });
    expect(langkahBerikutnya({ status: "diantar", ...KURIR })).toEqual({ ke: "tiba-di-pos", oleh: "penjual" });
  });
  it("ambil mandiri melewati tahap diantar", () => {
    expect(langkahBerikutnya({ status: "siap-jemput", ...MANDIRI })).toEqual({ ke: "tiba-di-pos", oleh: "penjual" });
  });
  it("pembeli yang menyelesaikan pesanan", () => {
    expect(langkahBerikutnya({ status: "tiba-di-pos", ...KURIR })).toEqual({ ke: "selesai", oleh: "pembeli" });
  });
  it("tidak ada langkah setelah selesai, dibatalkan, atau saat komplain (ditangani lewat panel komplain)", () => {
    expect(langkahBerikutnya({ status: "selesai", ...KURIR })).toBeNull();
    expect(langkahBerikutnya({ status: "dibatalkan", ...KURIR })).toBeNull();
    expect(langkahBerikutnya({ status: "komplain", ...KURIR })).toBeNull();
  });
});

describe("terapkanStatus & butuhKurir", () => {
  it("mencatat waktu tiba di pos", () => {
    const hasil = terapkanStatus(dasar, "tiba-di-pos", SEKARANG);
    expect(hasil.status).toBe("tiba-di-pos");
    expect(hasil.tibaDiPosPada).toBe(SEKARANG.toISOString());
  });
  it("status lain tidak menghapus waktu tiba yang sudah tercatat", () => {
    const sudah = { ...dasar, tibaDiPosPada: "2023-10-24T08:00:00.000Z" };
    expect(terapkanStatus(sudah, "selesai", SEKARANG).tibaDiPosPada).toBe("2023-10-24T08:00:00.000Z");
  });
  it("kurir hanya untuk kurir-desa setelah paket siap", () => {
    expect(butuhKurir(KURIR, "perlu-dikemas")).toBe(false);
    expect(butuhKurir(KURIR, "siap-jemput")).toBe(true);
    expect(butuhKurir(MANDIRI, "siap-jemput")).toBe(false);
  });
});

describe("pelepasan dana otomatis (keputusan D7)", () => {
  const tiba = (iso?: string): Pesanan => ({ ...dasar, status: "tiba-di-pos", tibaDiPosPada: iso });

  it("jatuh tempo 24 jam setelah tiba di pos", () => {
    expect(jatuhTempoPelepasan(tiba("2023-10-23T10:00:00.000Z"))?.toISOString()).toBe("2023-10-24T10:00:00.000Z");
  });
  it("tidak berlaku bila belum tiba di pos atau tanpa waktu tercatat", () => {
    expect(jatuhTempoPelepasan({ status: "diantar", tibaDiPosPada: "2023-10-23T10:00:00.000Z" })).toBeUndefined();
    expect(jatuhTempoPelepasan(tiba(undefined))).toBeUndefined();
  });
  it("pesananJatuhTempo hanya memilih yang sudah lewat batas", () => {
    const lewat = tiba("2023-10-23T09:00:00.000Z");
    const belum = { ...tiba("2023-10-24T08:00:00.000Z"), id: "lain" };
    expect(pesananJatuhTempo([lewat, belum], SEKARANG)).toEqual([lewat]);
  });
  it("sisaWaktuPelepasan menjelaskan sisa jam", () => {
    expect(sisaWaktuPelepasan(tiba("2023-10-24T08:00:00.000Z"), SEKARANG)).toBe("sekitar 22 jam lagi");
    expect(sisaWaktuPelepasan(tiba("2023-10-23T10:30:00.000Z"), SEKARANG)).toBe("kurang dari 1 jam lagi");
    expect(sisaWaktuPelepasan(tiba("2023-10-22T10:00:00.000Z"), SEKARANG)).toBe("segera");
  });
});

describe("pembayaran", () => {
  it("COD tidak pernah lunas di muka", () => {
    expect(sudahLunas({ metodeBayar: "COD", status: "perlu-dikemas" })).toBe(false);
    expect(labelPembayaran({ metodeBayar: "COD", status: "perlu-dikemas" })).toBe("COD Kasir");
  });
  it("QRIS dan Saldo lunas setelah dikonfirmasi, belum lunas saat menunggu bayar", () => {
    expect(labelPembayaran({ metodeBayar: "QRIS", status: "perlu-dikemas" })).toBe("QRIS Lunas");
    expect(labelPembayaran({ metodeBayar: "SALDO", status: "diantar" })).toBe("Saldo Lunas");
    expect(labelPembayaran({ metodeBayar: "QRIS", status: "menunggu-pembayaran" })).toBe("Menunggu Bayar");
    expect(sudahLunas({ metodeBayar: "QRIS", status: "dibatalkan" })).toBe(false);
  });
});

describe("penyaring", () => {
  it("perluDijemput mengabaikan pesanan ambil mandiri", () => {
    const mandiri = PESANAN_LIST.find((p) => p.opsiPengiriman === "ambil-mandiri")!;
    expect(mandiri.status).toBe("perlu-dikemas");
    expect(perluDijemput(mandiri)).toBe(false);
  });
  it("setiap pesanan masuk ke tepat satu tab (selain tab Semua)", () => {
    const tabStatus = PESANAN_TABS.filter((t) => t.status !== null);
    const total = tabStatus.reduce((sum, t) => sum + pesananDiTab(PESANAN_LIST, t).length, 0);
    expect(total).toBe(PESANAN_LIST.length);
  });
  it("tab Semua berisi semua pesanan", () => {
    expect(pesananDiTab(PESANAN_LIST, PESANAN_TABS[0])).toHaveLength(PESANAN_LIST.length);
  });
});