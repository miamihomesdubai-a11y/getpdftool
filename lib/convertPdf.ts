"use client";

import { pdfjsLib } from "./pdfWorker";

export type ConvertedFile = { name: string; bytes: Uint8Array };

const copy = (b: Uint8Array) => {
  const out = new Uint8Array(b.byteLength);
  out.set(b);
  return out;
};

// ---------------------------------------------------------------------------
// PDF → Plain text
// ---------------------------------------------------------------------------

export async function pdfToText(
  bytes: Uint8Array,
  onProgress?: (cur: number, total: number) => void
): Promise<string> {
  const pdf = await pdfjsLib.getDocument({ data: copy(bytes) }).promise;
  const out: string[] = [];
  for (let i = 0; i < pdf.numPages; i++) {
    onProgress?.(i, pdf.numPages);
    const page = await pdf.getPage(i + 1);
    const content = await page.getTextContent();
    const lines = groupItemsByLine(content.items);
    const pageText = lines
      .map((line) => line.map((it) => it.str).join(" ").trim())
      .filter(Boolean)
      .join("\n");
    out.push(pageText);
  }
  onProgress?.(pdf.numPages, pdf.numPages);
  return out.join("\n\n----------\n\n");
}

// ---------------------------------------------------------------------------
// PDF → JPG (one JPG per page, optionally zipped)
// ---------------------------------------------------------------------------

export async function pdfToJpg(
  bytes: Uint8Array,
  dpi = 150,
  quality = 0.9,
  onProgress?: (cur: number, total: number) => void
): Promise<ConvertedFile[]> {
  const pdf = await pdfjsLib.getDocument({ data: copy(bytes) }).promise;
  const result: ConvertedFile[] = [];
  const scale = dpi / 72;
  for (let i = 0; i < pdf.numPages; i++) {
    onProgress?.(i, pdf.numPages);
    const page = await pdf.getPage(i + 1);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    const blob: Blob = await new Promise((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("encode failed"))),
        "image/jpeg",
        quality
      )
    );
    result.push({
      name: `page-${String(i + 1).padStart(3, "0")}.jpg`,
      bytes: new Uint8Array(await blob.arrayBuffer()),
    });
    canvas.width = 0;
    canvas.height = 0;
  }
  onProgress?.(pdf.numPages, pdf.numPages);
  return result;
}

// ---------------------------------------------------------------------------
// PDF → Word (.docx)
// ---------------------------------------------------------------------------

export async function pdfToDocx(
  bytes: Uint8Array,
  onProgress?: (cur: number, total: number) => void
): Promise<Uint8Array> {
  const docxLib = await import("docx");
  const { Document, Packer, Paragraph, TextRun, PageBreak } = docxLib;

  const pdf = await pdfjsLib.getDocument({ data: copy(bytes) }).promise;
  const children: InstanceType<typeof Paragraph>[] = [];

  for (let i = 0; i < pdf.numPages; i++) {
    onProgress?.(i, pdf.numPages);
    const page = await pdf.getPage(i + 1);
    const content = await page.getTextContent();
    const lines = groupItemsByLine(content.items);

    for (const line of lines) {
      const text = line
        .map((it) => it.str)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      if (text) {
        children.push(
          new Paragraph({ children: [new TextRun({ text })] })
        );
      } else {
        children.push(new Paragraph({ children: [] }));
      }
    }

    if (i < pdf.numPages - 1) {
      children.push(
        new Paragraph({ children: [new PageBreak()] })
      );
    }
  }

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  onProgress?.(pdf.numPages, pdf.numPages);
  return new Uint8Array(await blob.arrayBuffer());
}

// ---------------------------------------------------------------------------
// PDF → Excel (.xlsx) — one sheet per page, rows grouped by Y position
// ---------------------------------------------------------------------------

export async function pdfToXlsx(
  bytes: Uint8Array,
  onProgress?: (cur: number, total: number) => void
): Promise<Uint8Array> {
  const XLSX = await import("xlsx");

  const pdf = await pdfjsLib.getDocument({ data: copy(bytes) }).promise;
  const wb = XLSX.utils.book_new();

  for (let i = 0; i < pdf.numPages; i++) {
    onProgress?.(i, pdf.numPages);
    const page = await pdf.getPage(i + 1);
    const content = await page.getTextContent();
    const lines = groupItemsByLine(content.items);
    const rows: string[][] = lines.map((line) => line.map((it) => it.str));
    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, `Page ${i + 1}`.slice(0, 31));
  }

  const arr = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  onProgress?.(pdf.numPages, pdf.numPages);
  return new Uint8Array(arr);
}

// ---------------------------------------------------------------------------
// PDF → PowerPoint (.pptx) — image-per-slide for visual fidelity
// ---------------------------------------------------------------------------

export async function pdfToPptx(
  bytes: Uint8Array,
  dpi = 144,
  quality = 0.85,
  onProgress?: (cur: number, total: number) => void
): Promise<Uint8Array> {
  const pptxgenMod = await import("pptxgenjs");
  // pptxgenjs ships as a CommonJS default export.
  const PptxGen =
    (pptxgenMod as unknown as { default?: unknown }).default ?? pptxgenMod;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pres = new (PptxGen as any)();

  const pdf = await pdfjsLib.getDocument({ data: copy(bytes) }).promise;
  if (pdf.numPages === 0) {
    const blob = (await pres.write({ outputType: "blob" })) as Blob;
    return new Uint8Array(await blob.arrayBuffer());
  }

  // Make the slide size match the FIRST PDF page (in inches — 1 inch = 72pt).
  // For documents with varying page sizes, later pages are scaled to fit and
  // centred (letterboxed) so they keep their original aspect ratio.
  const firstPage = await pdf.getPage(1);
  const firstUnscaled = firstPage.getViewport({ scale: 1 });
  const layoutW = firstUnscaled.width / 72;
  const layoutH = firstUnscaled.height / 72;
  pres.defineLayout({ name: "GETPDFTOOL", width: layoutW, height: layoutH });
  pres.layout = "GETPDFTOOL";

  const scale = dpi / 72;

  for (let i = 0; i < pdf.numPages; i++) {
    onProgress?.(i, pdf.numPages);
    const page = await pdf.getPage(i + 1);
    const viewport = page.getViewport({ scale });
    const unscaled = page.getViewport({ scale: 1 });
    const pageW = unscaled.width / 72;
    const pageH = unscaled.height / 72;

    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    const dataUrl = canvas.toDataURL("image/jpeg", quality);

    // Fit this page proportionally inside the slide and centre it.
    const slideRatio = layoutW / layoutH;
    const pageRatio = pageW / pageH;
    let imgW: number;
    let imgH: number;
    if (pageRatio > slideRatio) {
      imgW = layoutW;
      imgH = layoutW / pageRatio;
    } else {
      imgH = layoutH;
      imgW = layoutH * pageRatio;
    }
    const imgX = (layoutW - imgW) / 2;
    const imgY = (layoutH - imgH) / 2;

    const slide = pres.addSlide();
    slide.addImage({
      data: dataUrl,
      x: imgX,
      y: imgY,
      w: imgW,
      h: imgH,
    });
    canvas.width = 0;
    canvas.height = 0;
  }

  // pptxgenjs returns a Blob in browser when outputType is "blob".
  const blob = (await pres.write({ outputType: "blob" })) as Blob;
  onProgress?.(pdf.numPages, pdf.numPages);
  return new Uint8Array(await blob.arrayBuffer());
}

// ---------------------------------------------------------------------------
// ZIP helper for multi-file outputs
// ---------------------------------------------------------------------------

export async function zipFiles(files: ConvertedFile[]): Promise<Uint8Array> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  for (const f of files) {
    zip.file(f.name, f.bytes);
  }
  const blob = await zip.generateAsync({ type: "blob" });
  return new Uint8Array(await blob.arrayBuffer());
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type RawTextItem = {
  str?: string;
  transform?: number[];
};

type LineItem = { x: number; str: string };

function groupItemsByLine(items: unknown[]): LineItem[][] {
  const tolerance = 3;
  const groups: { y: number; items: LineItem[] }[] = [];

  for (const raw of items) {
    const it = raw as RawTextItem;
    if (!it.str || !it.transform) continue;
    const x = it.transform[4];
    const y = it.transform[5];

    let group = groups.find((g) => Math.abs(g.y - y) < tolerance);
    if (!group) {
      group = { y, items: [] };
      groups.push(group);
    }
    group.items.push({ x, str: it.str });
  }

  // Top of page first (PDF y increases upward, so highest y = top).
  groups.sort((a, b) => b.y - a.y);
  return groups.map((g) => g.items.sort((a, b) => a.x - b.x));
}
