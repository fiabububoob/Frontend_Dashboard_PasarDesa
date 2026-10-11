"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MAKS_SPESIFIKASI } from "@/lib/constants";
import type { Spesifikasi } from "@/types";

interface SpesifikasiEditorProps {
  nilai: Spesifikasi[];
  onChange: (nilai: Spesifikasi[]) => void;
}

// Daftar spesifikasi produk (label–nilai), mis. "Berat Bersih" – "5 Kilogram".
// Baris yang belum lengkap otomatis dibuang saat disimpan.
export function SpesifikasiEditor({ nilai, onChange }: SpesifikasiEditorProps) {
  const ubahBaris = (index: number, patch: Partial<Spesifikasi>) => onChange(nilai.map((baris, i) => (i === index ? { ...baris, ...patch } : baris)));
  const hapusBaris = (index: number) => onChange(nilai.filter((_, i) => i !== index));
  const tambahBaris = () => onChange([...nilai, { label: "", nilai: "" }]);

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium text-ink-700">Spesifikasi produk</span>
        <span className="text-xs text-ink-400">
          {nilai.length}/{MAKS_SPESIFIKASI}
        </span>
      </div>

      <ul className="space-y-2">
        {nilai.map((baris, index) => (
          <li key={index} className="flex items-start gap-2">
            <Input
              aria-label={`Nama spesifikasi ${index + 1}`}
              value={baris.label}
              onChange={(e) => ubahBaris(index, { label: e.target.value })}
              placeholder="Mis. Berat Bersih"
              containerClassName="flex-1"
            />
            <Input
              aria-label={`Isi spesifikasi ${index + 1}`}
              value={baris.nilai}
              onChange={(e) => ubahBaris(index, { nilai: e.target.value })}
              placeholder="Mis. 5 Kilogram"
              containerClassName="flex-1"
            />
            <button type="button" aria-label={`Hapus spesifikasi ${index + 1}`} onClick={() => hapusBaris(index)} className="mt-2.5 rounded p-1 text-ink-400 hover:text-danger-600">
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </li>
        ))}
      </ul>

      {nilai.length < MAKS_SPESIFIKASI && (
        <Button variant="secondary" size="sm" className="mt-2" onClick={tambahBaris}>
          <Plus className="h-3.5 w-3.5" />
          Tambah spesifikasi
        </Button>
      )}
    </div>
  );
}