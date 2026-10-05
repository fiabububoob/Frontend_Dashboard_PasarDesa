// Util CSV kecil (tanpa library). Mendukung tanda kutip ("a,b" dan "" di dalam
// kutip) serta pemisah koma ATAU titik-koma — Excel versi Indonesia menyimpan
// CSV dengan titik-koma.
export function toCsv(rows: (string | number)[][]): string {
  const esc = (v: string | number) => {
    const s = String(v);
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return "\uFEFF" + rows.map((r) => r.map(esc).join(",")).join("\n");
}

export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const url = URL.createObjectURL(new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseCsv(text: string): string[][] {
  const clean = text.replace(/^\uFEFF/, "");
  const firstLine = clean.split(/\r?\n/, 1)[0] ?? "";
  const delim = firstLine.includes(";") && !firstLine.includes(",") ? ";" : ",";

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuote = false;

  for (let i = 0; i < clean.length; i++) {
    const c = clean[i];
    if (inQuote) {
      if (c === '"' && clean[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') inQuote = false;
      else cell += c;
    } else if (c === '"') inQuote = true;
    else if (c === delim) {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && clean[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}
