// Deklarasi tipe untuk impor sisi-efek CSS global (mis. `import "./globals.css"`).
// Tanpa ini, `tsc --noEmit` memunculkan TS2882 untuk impor CSS di app/layout.tsx.
declare module "*.css";
