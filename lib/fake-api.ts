// Pengganti sementara panggilan ke Express API. Mensimulasikan latensi jaringan
// supaya state loading → success/error benar-benar terlihat saat development.
// Saat backend siap, ganti pemanggilnya dengan fetch() sungguhan — bentuk
// pemakaiannya (Promise yang resolve/reject) sama, jadi UI tidak perlu diubah.
export function simulateRequest(ms = 1200, options?: { fail?: boolean }): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (options?.fail) reject(new Error("Simulated request failure"));
      else resolve();
    }, ms);
  });
}
