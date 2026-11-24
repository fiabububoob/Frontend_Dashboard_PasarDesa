import { describe, expect, it } from "vitest";
import {
  barisCsvLaporan,
  daftarHari,
  komoditasTerlaris,
  labelRentang,
  namaFileLaporan,
  penjualanHarian,
  ringkasanBulan,
  pesananDalamRentang,
  rentangDari,
  rentangValid,
  ringkasLaporan,
} from "@/lib/penjualan";
import { formatRupiahRingkas } from "@/lib/format";
import type { Pesanan } from "@/types";

// 23 Nov 2026 12:00 WIB
const SEKARANG = new Date("2026-11-23T12:00:00+07:00");

function psn(id: string, tanggalIso: string, total: number, items: [string, number][], status: Pesanan["status"] = "selesai"): Pesanan {
  return {
    id,
    pembeli: "Bu Sari",
    inisial: "S",
    alamat: "-",
    dropPoint: "-",
    opsiPengiriman: "kurir-desa",
    metodeBayar: "QRIS",
    status,
    waktu: "10:00 WIB",
    dibuatPada: `${tanggalIso}T10:00:00+07:00`,
    total,
    items: items.map(([komoditas, subtotal]) => ({ komoditas, jumlah: "1 kg", hargaSatuan: subtotal, subtotal })),
  };
}

const DATA: Pesanan[] = [
  psn("A", "2026-11-23", 100_000, [["Telur", 60_000], ["Cabai", 40_000]]),
  psn("B", "2026-11-22", 50_000, [["Telur", 50_000]]),
  psn("C", "2026-11-10", 200_000, [["Beras", 200_000]]), // di luar 7 hari, di dalam 30 hari
  psn("D", "2026-11-16", 80_000, [["Madu", 80_000]]), // 16 Nov = tepat sebelum 7 hari terakhir → masuk periode sebelumnya
  psn("E", "2026-11-23", 999_000, [["Telur", 999_000]], "dibatalkan"), // bukan selesai → diabaikan
];

describe("daftarHari", () => {
  it("berurutan lama → baru dan berakhir di hari ini (WIB)", () => {
    const h = daftarHari(SEKARANG, 7);
    expect(h).toHaveLength(7);
    expect(h[0]).toBe("2026-11-17");
    expect(h[6]).toBe("2026-11-23");
  });
});

describe("penjualanHarian", () => {
  it("menjumlah pesanan selesai per hari dan membandingkan dengan periode sebelumnya", () => {
    const d = penjualanHarian(DATA, 7, SEKARANG);
    expect(d.sekarang.at(-1)).toEqual({ tanggal: "2026-11-23", nilai: 100_000 });
    expect(d.sekarang.at(-2)).toEqual({ tanggal: "2026-11-22", nilai: 50_000 });
    expect(d.total).toBe(150_000);
    expect(d.sebelumnya).toHaveLength(7);
    expect(d.totalSebelumnya).toBe(280_000); // pesanan C (10 Nov) + D (16 Nov) jatuh di 10–16 Nov
    expect(d.perubahanPersen).toBe(-46); // (150-280)/280 = -46,4 → -46
  });
  it("tidak menghitung pesanan yang belum selesai/batal", () => {
    expect(penjualanHarian(DATA, 7, SEKARANG).sekarang.at(-1)?.nilai).toBe(100_000);
  });
  it("perubahanPersen null bila periode sebelumnya 0", () => {
    expect(penjualanHarian([DATA[0]], 7, SEKARANG).perubahanPersen).toBeNull();
  });
  it("pesanan tanpa dibuatPada dilewati", () => {
    const tanpa = { ...DATA[0], dibuatPada: undefined };
    expect(penjualanHarian([tanpa], 7, SEKARANG).total).toBe(0);
  });
});

describe("komoditasTerlaris", () => {
  it("mengurutkan berdasarkan nilai dan menghitung porsi", () => {
    const r = komoditasTerlaris(DATA, 7, SEKARANG, 5);
    expect(r.total).toBe(150_000);
    expect(r.top.map((k) => k.nama)).toEqual(["Telur", "Cabai"]);
    expect(r.top[0]).toMatchObject({ nilai: 110_000, persen: 73 });
    expect(r.persenLain).toBe(0);
  });
  it("30 hari ikut memasukkan pesanan lama", () => {
    expect(komoditasTerlaris(DATA, 30, SEKARANG, 5).top[0].nama).toBe("Beras");
  });
  it("sisa di luar Top N dilaporkan sebagai persenLain", () => {
    const r = komoditasTerlaris(DATA, 30, SEKARANG, 2);
    expect(r.top).toHaveLength(2);
    expect(r.persenLain).toBeGreaterThan(0);
  });
  it("kosong tidak error", () => {
    expect(komoditasTerlaris([], 7, SEKARANG)).toEqual({ top: [], persenLain: 0, total: 0 });
  });
});

describe("rentang laporan", () => {
  it("preset", () => {
    expect(rentangDari("hari-ini", SEKARANG)).toEqual({ dari: "2026-11-23", sampai: "2026-11-23" });
    expect(rentangDari("7-hari", SEKARANG)).toEqual({ dari: "2026-11-17", sampai: "2026-11-23" });
    expect(rentangDari("30-hari", SEKARANG).dari).toBe("2026-10-25");
    expect(rentangDari("bulan-ini", SEKARANG)).toEqual({ dari: "2026-11-01", sampai: "2026-11-23" });
  });
  it("rentangValid", () => {
    expect(rentangValid({ dari: "2026-11-10", sampai: "2026-11-23" })).toBe(true);
    expect(rentangValid({ dari: "2026-11-23", sampai: "2026-11-23" })).toBe(true);
    expect(rentangValid({ dari: "2026-11-24", sampai: "2026-11-23" })).toBe(false);
    expect(rentangValid({ dari: "", sampai: "2026-11-23" })).toBe(false);
  });
  it("pesananDalamRentang inklusif di kedua ujung, hanya selesai, terbaru dulu", () => {
    const r = pesananDalamRentang(DATA, { dari: "2026-11-10", sampai: "2026-11-23" });
    expect(r.map((p) => p.id)).toEqual(["A", "B", "D", "C"]);
  });
  it("ringkasLaporan", () => {
    expect(ringkasLaporan(pesananDalamRentang(DATA, { dari: "2026-11-22", sampai: "2026-11-23" }))).toEqual({ jumlah: 2, total: 150_000, rataRata: 75_000 });
    expect(ringkasLaporan([])).toEqual({ jumlah: 0, total: 0, rataRata: 0 });
  });
  it("label & nama file", () => {
    expect(labelRentang({ dari: "2026-11-10", sampai: "2026-11-23" })).toMatch(/10 Nov 2026\s–\s23 Nov 2026/);
    expect(namaFileLaporan({ dari: "2026-11-10", sampai: "2026-11-23" })).toBe("laporan-pesanan-2026-11-10_sd_2026-11-23.csv");
    expect(namaFileLaporan({ dari: "2026-11-23", sampai: "2026-11-23" })).toBe("laporan-pesanan-2026-11-23.csv");
  });
  it("CSV: ringkasan, header, lalu satu baris per pesanan", () => {
    const r = { dari: "2026-11-22", sampai: "2026-11-23" };
    const baris = barisCsvLaporan(pesananDalamRentang(DATA, r), r);
    expect(baris[2]).toEqual(["Jumlah pesanan", 2]);
    expect(baris[6][0]).toBe("Kode Pesanan");
    expect(baris).toHaveLength(7 + 2);
    expect(baris[7][0]).toBe("A");
    expect(baris[7].at(-1)).toBe(100_000);
  });
});

describe("formatRupiahRingkas", () => {
  it("juta, ribu, dan di bawah seribu", () => {
    expect(formatRupiahRingkas(6_100_000)).toBe("Rp 6,1 jt");
    expect(formatRupiahRingkas(850_000)).toBe("Rp 850 rb");
    expect(formatRupiahRingkas(500)).toBe("Rp 500");
  });
});

describe("ringkasanBulan", () => {
  it("menghitung transaksi bulan ini dan perubahan vs bulan lalu", () => {
    const data = [
      psn("N1", "2026-11-05", 300_000, [["Telur", 300_000]]),
      psn("N2", "2026-11-20", 100_000, [["Telur", 100_000]]),
      psn("O1", "2026-10-15", 200_000, [["Telur", 200_000]]),
      psn("X", "2026-11-21", 900_000, [["Telur", 900_000]], "dibatalkan"),
    ];
    expect(ringkasanBulan(data, SEKARANG)).toEqual({ transaksi: 2, perubahanPersen: 100 });
  });
  it("perubahan null bila bulan lalu kosong; Januari melihat Desember", () => {
    expect(ringkasanBulan([psn("A", "2026-11-05", 1, [["T", 1]])], SEKARANG).perubahanPersen).toBeNull();
    const jan = new Date("2027-01-10T12:00:00+07:00");
    expect(ringkasanBulan([psn("D", "2026-12-20", 100, [["T", 100]]), psn("J", "2027-01-02", 150, [["T", 150]])], jan)).toEqual({ transaksi: 1, perubahanPersen: 50 });
  });
});
