# PasarDesa Dashboard (Next.js)

Dashboard admin untuk BUMDes Sukorejo — kelola komoditas hasil tani, pesanan &
kurir desa, kas, dan pengaturan lapak. Dibangun dengan Next.js 14 (App
Router) + TypeScript + Tailwind CSS.

## Menjalankan project

```bash
npm install
npm run dev      # buka http://localhost:3000
```

Build production:

```bash
npm run build
npm run start
```

## Struktur folder & filosofi maintainability

Prinsip utamanya: **data terpisah dari tampilan, dan tampilan tersusun dari
komponen kecil yang bisa dipakai ulang.** Kalau kamu mau ubah konten, kamu
edit file di `lib/data/`. Kalau kamu mau ubah tampilan, kamu edit file di
`components/`. Halaman di `app/` hampir tidak pernah perlu disentuh.

```
app/
  layout.tsx                 # HTML shell root (font, metadata)
  globals.css                # Tailwind entrypoint
  (dashboard)/
    layout.tsx                # Sidebar + Topbar, dipakai semua halaman dashboard
    page.tsx                  # Ringkasan (/)
    komoditas/page.tsx        # Manajemen Komoditas
    pesanan/page.tsx          # Pesanan & Kurir Desa
    kas/page.tsx              # Kas & Penarikan Saldo
    pengaturan/page.tsx       # Pengaturan Lapak Tani

components/
  ui/          # Komponen generik dipakai di semua halaman:
               # Card, Badge, Button, Toggle, Input, PageHeader, StatCardGrid,
               # FilterPills, Pagination, Toast, ConfirmDialog, CountUp,
               # EmptyState, Skeleton
  layout/      # Sidebar, Topbar
  providers/   # AppProviders (Toast + Confirm dialog), dipasang sekali di layout
  showcase/    # Halaman panduan komponen (/komponen)
  dashboard/   # Komponen khusus halaman Ringkasan
  komoditas/   # Komponen khusus halaman Manajemen Komoditas
  pesanan/     # Komponen khusus halaman Pesanan & Kurir Desa
  kas/         # Komponen khusus halaman Kas & Saldo
  pengaturan/  # Komponen khusus halaman Pengaturan Lapak Tani

lib/
  data/        # "Database palsu" — satu file per fitur (komoditas.ts,
               # pesanan.ts, kas.ts, ringkasan.ts, pengaturan.ts).
               # Ini yang kamu ganti ke fetch() ke Express API nanti.
  nav-items.ts # Satu-satunya sumber daftar menu sidebar
  format.ts    # formatRupiah(), formatNumber()
  motion.ts    # Token durasi & easing (satu sumber untuk semua animasi)
  fake-api.ts  # simulateRequest() — pengganti sementara panggilan API
  hooks/       # useActionStatus() — siklus idle → loading → success/error

types/
  index.ts     # Semua interface TypeScript (Komoditas, Pesanan, dst)
```

## Cara menambah/mengubah sesuatu

**Mengubah data yang tampil (angka, nama, status):**
Edit file terkait di `lib/data/`. Contoh: mau ubah stok "Cabai Rawit Merah"
di halaman Komoditas → edit `lib/data/komoditas.ts`, cari objeknya, ubah
`stok`. Tidak perlu sentuh komponen React sama sekali.

**Menambah menu baru di sidebar:**
Tambah satu baris di `lib/nav-items.ts`, lalu buat
`app/(dashboard)/nama-menu/page.tsx`. Sidebar otomatis menampilkannya dan
otomatis dapat layout (Sidebar+Topbar) yang sama.

**Mengubah tampilan card/tombol/badge di seluruh aplikasi:**
Edit komponennya sekali di `components/ui/`. Karena semua halaman memakai
komponen yang sama (bukan copy-paste markup), perubahan otomatis konsisten
di semua tempat.

**Mengubah warna/tema:**
Edit token warna di `tailwind.config.ts` (`colors.brand`, `colors.ink`, dst).
Semua komponen memakai token ini (`bg-brand-600`, `text-ink-500`, dst), jadi
tidak ada hex code yang tersebar di banyak file.

## Menghubungkan ke backend Express

Saat ini semua data berasal dari `lib/data/*.ts` (mock, statis). Untuk
menyambungkan ke API Express:

1. Buat `lib/api.ts` berisi fungsi fetch, contoh:
   ```ts
   export async function getKomoditas() {
     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/komoditas`, {
       headers: { Authorization: `Bearer ${token}` },
     });
     return res.json();
   }
   ```
2. Di `app/(dashboard)/komoditas/page.tsx`, ganti
   `import { KOMODITAS_LIST } from "@/lib/data/komoditas"` dengan
   `const data = await getKomoditas()` (halaman ini React Server Component,
   jadi bisa langsung `await` tanpa `useEffect`).
3. Tipe data di `types/index.ts` dipakai sebagai kontrak — sesuaikan bila
   bentuk response API berbeda dari mock.

Buat file `.env.local` di root:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Catatan implementasi

- Semua halaman adalah **React Server Component** secara default. Hanya
  bagian yang butuh interaktivitas (toggle, filter, pilih pesanan di daftar,
  form) yang ditandai `"use client"` — ini menjaga bundle JS tetap kecil.
- Chart tren panen di halaman Ringkasan dibuat manual dengan CSS (bukan
  library chart) karena datanya kecil. Kalau nanti butuh chart yang lebih
  kompleks (banyak seri data, tooltip, zoom), pertimbangkan `recharts`.
- Belum ada state management global (Redux/Zustand) karena skalanya belum
  perlu — setiap halaman independen. Tambahkan kalau nanti ada state yang
  perlu dibagi antar halaman (misal keranjang, sesi login).

## Micro-interaction & Motion UX

Semua animasi mengikuti materi P7 dan diatur dari satu tempat: `lib/motion.ts`
(dibaca oleh `tailwind.config.ts`). Ubah angka di sana, seluruh aplikasi ikut berubah.

| Token | Durasi | Easing | Dipakai untuk |
|---|---|---|---|
| `feedback` | 100 ms | ease-out | hover, pressed, toggle, warna tombol |
| `enter` | 225 ms | ease-out | dialog, toast, kartu muncul |
| `exit` | 195 ms | ease-in | dialog & toast menghilang |
| `move` | 300 ms | ease-in-out | perpindahan/transisi, progress bar |

Kelas Tailwind-nya: `duration-feedback`, `ease-enter`, `animate-dialog-in`, `animate-fade-up`, dst.

### Prinsip yang dipakai (dan yang sengaja tidak)

| Prinsip | Status | Alasan / lokasi |
|---|---|---|
| Easing | Dipakai | Semua transisi memakai kurva sesuai arah gerak (masuk/keluar/pindah) |
| Offset & Delay | Dipakai | Kartu statistik & baris tabel muncul berurutan (`stagger()` 40 ms, maks. 8 item) |
| Transformation | Dipakai | Tombol idle → loading → success; stepper pesanan angka → centang |
| Value Change | Dipakai | `CountUp` pada angka saldo/omzet di kartu statistik |
| Overlay | Dipakai | Dialog konfirmasi & toast menumpuk di atas halaman |
| Obscuration | Dipakai | Latar dialog diburamkan (`backdrop-blur`) |
| Parenting, Masking, Cloning, Parallax, Dimensionality, Dolly & Zoom | Tidak dipakai | Tidak ada pola UI yang membutuhkannya di dashboard admin data-padat (tanpa story, FAB, kartu flip, peta). Parallax justru mengganggu keterbacaan tabel. |

### Kapan memakai dialog konfirmasi

Hanya untuk aksi yang **berdampak besar atau sulit dibatalkan**: menyimpan pengaturan,
membatalkan perubahan, menarik dana, menandai pesanan siap (segel QR), dan menutup katalog
(mode jeda tanam). Aksi yang mudah dibalik (toggle tampil/sembunyi komoditas, "Siapkan Paket")
cukup diberi feedback toast/state tombol — terlalu banyak dialog membuat pengguna kebal dan
asal klik "Ya".

```tsx
const confirm = useConfirm();
const toast = useToast();
const { status, run } = useActionStatus();

const ok = await confirm({ title: "Yakin ingin menyimpan perubahan?", confirmLabel: "Ya, Simpan" });
if (!ok) return;
const saved = await run(() => api.save(data));      // ganti simulateRequest dengan API asli
toast({ type: saved ? "success" : "error", title: saved ? "Tersimpan" : "Gagal menyimpan" });
// <Button status={status}>Simpan</Button>  → otomatis menampilkan loading/success/error
```

### State komponen

`Button` mendukung default · hover · pressed · loading · success · error · disabled.
`Input` mendukung default · focus · error · success · disabled. Semuanya bisa dilihat
di satu halaman: **`/komponen`**.

### Edge case & aksesibilitas

- Empty state: daftar pesanan (hasil pencarian nihil), tabel komoditas, tabel transaksi (`EmptyState`).
- Loading & error halaman: `app/(dashboard)/loading.tsx` dan `error.tsx`.
- `prefers-reduced-motion`: semua animasi dipangkas otomatis (lihat `globals.css`); `CountUp` langsung menampilkan nilai akhir.
- Dialog: fokus terkunci di dalam dialog, `Esc` = batal, fokus kembali ke tombol pemicu.
- Form Pengaturan: tombol Simpan/Batal nonaktif sampai ada perubahan; validasi memakai atribut HTML (`required`, `minLength`, `pattern`).

> Catatan: `lib/fake-api.ts` hanya mensimulasikan latensi. Ganti dengan `fetch` ke Express
> saat backend siap — UI tidak perlu diubah karena hanya bergantung pada Promise resolve/reject.


## Rombakan visual: warna, font, dan copy

### Warna
Palet lama pakai hijau generik (mirip warna bawaan komponen UI kit) di atas
latar abu-abu kebiruan. Diganti dengan:
- **Brand**: hijau daun yang lebih dalam dan earthy (`#3B7048` sebagai warna
  utama), terinspirasi dari palet fintech/agrikultur yang memakai satu warna
  hijau yang percaya diri di atas latar hangat (pola yang dipakai Wise, dan
  skema warna analog hijau-zaitun yang umum di produk agrikultur/sustainability).
- **Netral hangat**: `ink` dan `surface` tidak lagi bertone biru, sekarang
  condong ke warm charcoal/cream — biar berasa "kertas & tanah", bukan "app
  korporat dingin".
- **Semantik terpisah**: ditambah token `info` (indigo lembut, untuk badge
  QRIS/status netral) supaya tidak lagi pakai `blue-600` mentah yang tidak
  senada dengan palet hangat. `warn` (amber/harvest) dan `danger` (terracotta)
  juga ditata ulang jadi satu ramp resmi — sebelumnya beberapa tempat memakai
  `amber-400`, `blue-50`, `slate-300` langsung (tidak lewat token), sekarang
  semua sudah lewat `tailwind.config.ts`.

Ganti warna brand di satu tempat: `tailwind.config.ts` → `theme.extend.colors`.

### Font
Sebelumnya cuma system font stack (fallback darurat karena sandbox tidak ada
akses internet). Sekarang pakai pasangan font yang lazim dipakai produk SaaS
modern:
- **Plus Jakarta Sans** (600–800) untuk heading — dipasang lewat kelas
  `font-display`, dipakai di judul halaman, judul section, angka statistik.
- **Inter** untuk body & tabel — tetap default (`font-sans`), karena data
  padat di dashboard ini butuh keterbacaan tinggi di ukuran kecil.

Kedua font dimuat lewat `next/font/google` di `app/layout.tsx` — otomatis
di-self-host oleh Next.js saat build (butuh akses internet saat `npm run
build`/`npm run dev` pertama kali, standar untuk semua project Next.js yang
pakai `next/font/google`).

### Copy
Deskripsi yang tadinya panjang gaya laporan dipangkas jadi satu kalimat
pendek dan actionable — pola microcopy yang umum dipakai di web (bandingkan
dengan deskripsi singkat di bawah judul halaman produk SaaS pada umumnya).
Contoh: deskripsi halaman Komoditas yang tadinya tiga baris jadi "Pantau
stok, harga, dan jadwal panen semua komoditas di satu tempat."

## Arsitektur & konvensi kode

**Prinsip:** komponen hanya merangkai tampilan; aturan bisnis dan perhitungan ada di `lib/` sebagai fungsi murni
(mudah diuji); state tiap domain dipisah; elemen UI yang berulang dijadikan komponen bersama.

| Lapisan | Lokasi | Isi |
|---|---|---|
| Tipe | `types/*.ts` | Dibagi per domain (komoditas, pesanan, kas, pengaturan, detail); diekspor ulang dari `types/index.ts` |
| Logika murni | `lib/*.ts` | `stats` (kartu statistik), `komoditas`, `kas`, `pesanan`, `stok`, `pengaturan`, `notifikasi`, `search`, `text`, `format`, `csv`, `constants` |
| Data dummy | `lib/data/*.ts` | Data awal; ganti dengan panggilan API saat backend siap |
| State | `components/providers/slices/*` | Satu hook per domain; `DashboardDataProvider` menyatukannya dan menjalankan aksi lintas-domain (pesanan selesai → penjualan masuk kas) |
| Hooks | `lib/hooks/*`, `components/providers/useStatusLapak.ts` | `usePaginasi`, `useSekarang`, `useClickOutside`, `useActionStatus`, `useStatusLapak` |
| UI bersama | `components/ui/*` | `Button`/`LinkButton` (gaya di `buttonStyles.ts`), `Field`, `Select`, `FormActions`, `SectionHeader`, `Avatar`, `FilterPills`, `Pagination`, … |
| Modal | `components/detail/*` | Semua modal dibuka lewat `useDetail().open({ type, … })` (`DetailTarget`); `useSimpanModal` = alur simpan form yang seragam, `PrintActions` = tombol cetak |
| Halaman | `components/<fitur>/*Workspace.tsx` | Merangkai bagian-bagian halaman; `app/**/page.tsx` hanya memasangnya |

**Aturan yang dipakai:**
- Tidak ada angka/teks "ajaib" yang tersebar: konstanta bersama di `lib/constants.ts` (ukuran halaman, latensi simulasi, jam jemput, periode laporan, ongkir).
- Angka di layar dihitung dari data hidup lewat `lib/stats.ts`, bukan ditulis tangan.
- Pencarian/filter memakai satu fungsi (`cocokSemuaKata`); paginasi memakai `usePaginasi`; format tanggal/jam/rupiah hanya lewat `lib/format.ts`.
- Komponen yang melebihi ±200 baris dipecah (mis. `PesananDetail` → `pesanan/detail/*`, `Topbar` → `layout/topbar/*`).
- Nama domain memakai bahasa Indonesia (sesuai istilah di UI); infrastruktur (hooks, util) bahasa Inggris/umum.

**Perintah:**

```bash
npm run dev        # jalankan lokal
npm run typecheck  # pemeriksaan tipe
npm run lint       # ESLint (next/core-web-vitals)
npm run test       # tes unit logika murni (vitest, folder tests/)
npm run format     # Prettier
```

**Cetak / PDF** — modal yang bisa dicetak memakai `.print-area` / `.no-print` (lihat `@media print` di `app/globals.css`).
Pilih "Simpan sebagai PDF" di dialog cetak browser untuk mendapatkan file PDF.

**Pengaturan** — form memakai *draft* (`PengaturanForm` → `usePengaturanForm()`): isian ditulis ke draft dan baru menjadi
pengaturan resmi setelah "Simpan Pengaturan". Mode jeda tanam berlaku langsung (setelah konfirmasi) dan tidak termasuk draft.
Status buka/tutup dihitung dari jadwal + jam WIB (`lib/pengaturan.ts`).

**Tampilan** — gaya "clean": latar putih, kartu hanya ber-border tipis, token warna di `tailwind.config.ts`.
