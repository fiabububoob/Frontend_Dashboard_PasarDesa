/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Foto produk (maks. 5 MB) dikirim sebagai data URL lewat server action.
  // Foto unggahan (bukti komplain, ulasan, produk) dilayani server backend; diteruskan lewat alamat dashboard sendiri
  // supaya browser admin tidak perlu menjangkau host server secara langsung.
  async rewrites() {
    const asal = (process.env.API_URL || "http://localhost:3000/api").replace(/\/api\/?$/, "");
    return [{ source: "/uploads/:path*", destination: `${asal}/uploads/:path*` }];
  },
  experimental: { serverActions: { bodySizeLimit: "8mb" } },
};

module.exports = nextConfig;
