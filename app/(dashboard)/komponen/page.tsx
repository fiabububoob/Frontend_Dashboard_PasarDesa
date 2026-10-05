import { PageHeader } from "@/components/ui/PageHeader";
import { ComponentShowcase } from "@/components/showcase/ComponentShowcase";

// Halaman panduan internal (tidak ada di sidebar; buka lewat /komponen).
// Berguna untuk mengecek semua state komponen di satu tempat sebelum rilis.
export default function KomponenPage() {
  return (
    <>
      <PageHeader
        eyebrow="Panduan Internal"
        title="Komponen & State Interaksi"
        description="Semua state micro-interaction dan pola motion yang dipakai di dashboard, dikumpulkan di satu halaman."
      />
      <ComponentShowcase />
    </>
  );
}
