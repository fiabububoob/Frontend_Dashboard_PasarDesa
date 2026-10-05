// Berbeda dari layout, template di-mount ulang setiap pindah halaman. Fade singkat
// (225ms, ease-out) memberi tahu pengguna bahwa konteks berganti (fungsi "Orientation").
export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade-in space-y-6">{children}</div>;
}
