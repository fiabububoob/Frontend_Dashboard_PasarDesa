import { describe, expect, it } from "vitest";
import { parseCsv, toCsv } from "@/lib/csv";

describe("toCsv", () => {
  it("memberi tanda kutip pada sel yang memuat koma atau kutip", () => {
    const csv = toCsv([["a", 'b,"c"'], [1, 2]]);
    expect(csv).toBe('\uFEFFa,"b,""c"""\n1,2');
  });
});

describe("parseCsv", () => {
  it("membaca pemisah koma dan sel berkutip", () => {
    expect(parseCsv('nama,ket\n"Beras, Merah","a ""b"""')).toEqual([
      ["nama", "ket"],
      ["Beras, Merah", 'a "b"'],
    ]);
  });
  it("mendeteksi pemisah titik-koma (Excel Indonesia)", () => {
    expect(parseCsv("a;b\n1;2")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });
  it("mengabaikan baris kosong dan BOM", () => {
    expect(parseCsv("\uFEFFa,b\n\n1,2\n")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });
  it("round-trip: toCsv lalu parseCsv menghasilkan data semula", () => {
    const data = [
      ["nama", "catatan"],
      ["Cabai", 'pedas, "segar"'],
    ];
    expect(parseCsv(toCsv(data))).toEqual(data);
  });
});
