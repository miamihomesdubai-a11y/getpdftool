"use client";

// Conversion functions that produce a PDF (Uint8Array) from various inputs.
// All run entirely in the browser.

const PAGE_W_PT = 612; // US Letter, 8.5"
const PAGE_H_PT = 792; // US Letter, 11"

/** Read a File as ArrayBuffer. */
const readArrayBuffer = (f: File) =>
  new Promise<ArrayBuffer>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as ArrayBuffer);
    r.onerror = () => reject(new Error("Could not read file."));
    r.readAsArrayBuffer(f);
  });

/** Read a File as text. */
const readText = (f: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error("Could not read file."));
    r.readAsText(f);
  });

// ---------------------------------------------------------------------------
// Images (JPEG / PNG) → PDF
// ---------------------------------------------------------------------------

export async function imagesToPdf(
  files: File[],
  onProgress?: (cur: number, total: number) => void
): Promise<Uint8Array> {
  if (files.length === 0) throw new Error("No images selected.");
  const { PDFDocument } = await import("pdf-lib");
  const pdf = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    onProgress?.(i, files.length);
    const file = files[i];
    const isJpg =
      file.type === "image/jpeg" || /\.jpe?g$/i.test(file.name);
    const isPng =
      file.type === "image/png" || /\.png$/i.test(file.name);
    if (!isJpg && !isPng) {
      throw new Error(
        `${file.name} isn't a JPEG or PNG. Please choose image files.`
      );
    }
    const buf = new Uint8Array(await readArrayBuffer(file));
    const image = isPng
      ? await pdf.embedPng(buf)
      : await pdf.embedJpg(buf);
    // Each image becomes a page sized to match the image — keeps full resolution.
    const page = pdf.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }

  onProgress?.(files.length, files.length);
  return pdf.save();
}

// ---------------------------------------------------------------------------
// HTML → PDF
// ---------------------------------------------------------------------------

/** Render an HTML string to a tall canvas, then split it into PDF pages. */
async function renderHtmlToCanvas(
  html: string,
  widthPx = 816 // 8.5" at 96 DPI
): Promise<HTMLCanvasElement> {
  const html2canvas = (await import("html2canvas")).default;
  const container = document.createElement("div");
  container.style.cssText = `position: absolute; left: -10000px; top: 0; width: ${widthPx}px; background: white; box-sizing: border-box;`;
  // If the user provided a full HTML doc, the body is what we actually need.
  // Otherwise, just inject markup as-is.
  container.innerHTML = html;
  document.body.appendChild(container);

  // Give browser a moment to lay out + load any images / fonts.
  await new Promise((r) => setTimeout(r, 300));

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      windowWidth: widthPx,
      logging: false,
    });
    return canvas;
  } finally {
    container.remove();
  }
}

async function canvasToMultiPagePdf(
  canvas: HTMLCanvasElement,
  pageWidthPt = PAGE_W_PT,
  pageHeightPt = PAGE_H_PT,
  onProgress?: (cur: number, total: number) => void
): Promise<Uint8Array> {
  const { PDFDocument } = await import("pdf-lib");
  const pdf = await PDFDocument.create();

  // canvas pixels per PDF point.
  const pxPerPt = canvas.width / pageWidthPt;
  const sliceHeightPx = pageHeightPt * pxPerPt;
  const totalPages = Math.max(1, Math.ceil(canvas.height / sliceHeightPx));

  for (let i = 0; i < totalPages; i++) {
    onProgress?.(i, totalPages);
    const y = i * sliceHeightPx;
    const sliceH = Math.min(sliceHeightPx, canvas.height - y);
    const slice = document.createElement("canvas");
    slice.width = canvas.width;
    slice.height = Math.ceil(sliceH);
    const ctx = slice.getContext("2d");
    if (!ctx) break;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, slice.width, slice.height);
    ctx.drawImage(canvas, 0, -y);

    const blob: Blob = await new Promise((resolve, reject) =>
      slice.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("encode failed"))),
        "image/jpeg",
        0.85
      )
    );
    const bytes = await blob.arrayBuffer();
    const image = await pdf.embedJpg(bytes);

    const page = pdf.addPage([pageWidthPt, pageHeightPt]);
    const slicePtHeight = sliceH / pxPerPt;
    page.drawImage(image, {
      x: 0,
      y: pageHeightPt - slicePtHeight,
      width: pageWidthPt,
      height: slicePtHeight,
    });
    slice.width = 0;
    slice.height = 0;
  }

  onProgress?.(totalPages, totalPages);
  return pdf.save();
}

export async function htmlToPdf(
  html: string,
  onProgress?: (cur: number, total: number) => void
): Promise<Uint8Array> {
  if (!html.trim()) throw new Error("No HTML to convert.");
  const canvas = await renderHtmlToCanvas(html);
  return canvasToMultiPagePdf(canvas, PAGE_W_PT, PAGE_H_PT, onProgress);
}

export async function htmlFileToPdf(
  file: File,
  onProgress?: (cur: number, total: number) => void
): Promise<Uint8Array> {
  const text = await readText(file);
  return htmlToPdf(text, onProgress);
}

// ---------------------------------------------------------------------------
// Word (.docx) → PDF
// ---------------------------------------------------------------------------

const DOCX_HTML_WRAPPER = (body: string) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  body { font-family: "Calibri", "Helvetica", Arial, sans-serif; color: #111;
         padding: 56px 64px; line-height: 1.45; font-size: 11pt; margin: 0; }
  h1, h2, h3, h4, h5, h6 { color: #1f2937; margin-top: 1.2em; margin-bottom: 0.4em; }
  h1 { font-size: 22pt; }
  h2 { font-size: 17pt; }
  h3 { font-size: 14pt; }
  p { margin: 0 0 0.8em 0; }
  ul, ol { margin: 0 0 0.8em 1.5em; }
  table { border-collapse: collapse; width: 100%; margin: 0.5em 0; }
  td, th { border: 1px solid #cbd5e1; padding: 6px 8px; vertical-align: top; }
  th { background: #f1f5f9; }
  img { max-width: 100%; height: auto; }
  a { color: #2563eb; }
</style>
</head>
<body>${body}</body>
</html>`;

export async function wordToPdf(
  file: File,
  onProgress?: (cur: number, total: number) => void
): Promise<Uint8Array> {
  const isDocx =
    /\.docx$/i.test(file.name) ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (!isDocx)
    throw new Error("Please choose a .docx Word file (Word 2007 or newer).");

  const mammothMod = await import("mammoth");
  // mammoth's default export differs between bundlers — use whatever's there.
  const mammoth =
    (mammothMod as unknown as { default?: typeof mammothMod }).default ??
    mammothMod;
  const arrayBuffer = await readArrayBuffer(file);
  const result = await mammoth.convertToHtml({ arrayBuffer });
  const html = DOCX_HTML_WRAPPER(result.value);

  const canvas = await renderHtmlToCanvas(html);
  return canvasToMultiPagePdf(canvas, PAGE_W_PT, PAGE_H_PT, onProgress);
}

// ---------------------------------------------------------------------------
// Excel (.xlsx) → PDF
// ---------------------------------------------------------------------------

const XLSX_HTML_WRAPPER = (body: string) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  body { font-family: "Calibri", "Helvetica", Arial, sans-serif; color: #111;
         padding: 32px 36px; margin: 0; font-size: 10pt; }
  h2 { color: #1f2937; margin: 18px 0 8px; font-size: 14pt; }
  table { border-collapse: collapse; width: 100%; margin-bottom: 18px; }
  td, th { border: 1px solid #94a3b8; padding: 4px 6px; vertical-align: top;
           font-size: 9pt; }
  th { background: #f1f5f9; font-weight: 600; }
</style>
</head>
<body>${body}</body>
</html>`;

export async function excelToPdf(
  file: File,
  onProgress?: (cur: number, total: number) => void
): Promise<Uint8Array> {
  const isXlsx = /\.xlsx?$/i.test(file.name) || file.type.includes("sheet");
  if (!isXlsx)
    throw new Error("Please choose an .xlsx Excel file.");

  const XLSX = await import("xlsx");
  const buf = await readArrayBuffer(file);
  const wb = XLSX.read(new Uint8Array(buf), { type: "array" });

  const parts: string[] = [];
  for (const name of wb.SheetNames) {
    const sheet = wb.Sheets[name];
    const tableHtml = XLSX.utils.sheet_to_html(sheet, { editable: false });
    parts.push(`<h2>${escapeHtml(name)}</h2>${tableHtml}`);
  }
  const html = XLSX_HTML_WRAPPER(parts.join(""));

  const canvas = await renderHtmlToCanvas(html);
  return canvasToMultiPagePdf(canvas, PAGE_W_PT, PAGE_H_PT, onProgress);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
