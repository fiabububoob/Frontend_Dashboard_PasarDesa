interface SectionHeaderProps {
  judul: string;
  deskripsi?: string;
}

// Judul bagian pada form panjang (Pengaturan): judul + satu kalimat penjelas.
export function SectionHeader({ judul, deskripsi }: SectionHeaderProps) {
  return (
    <div>
      <h2 className="text-base font-semibold text-ink-900">{judul}</h2>
      {deskripsi && <p className="mt-0.5 text-sm text-ink-500">{deskripsi}</p>}
    </div>
  );
}
