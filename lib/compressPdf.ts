"use client";

import { PDFDocument } from "pdf-lib";
import { pdfjsLib } from "./pdfWorker";

export type CompressLevel = "lossless" | "medium" | "strong";

export type CompressLevelInfo = {
  id: CompressLevel;
  label: string;
  description: string;
  icon: string;
  /** Approximate quality tradeoff label for the UI. */
  tradeoff: string;
};

export const COMPRESS_LEVELS: CompressLevelInfo[] = [
  {
    id: "lossless",
    label: "High quality",
    icon: "✨",
    description: "Re-saves the PDF with structural optimisations only. Text stays selectable and quality is identical to the original. Best for already-clean PDFs.",
    tradeoff: "Smallest file-size reduction · keeps text",
  },
  {
    id: "medium",
    label: "Recommended",
    icon: "📄",
    description: "Re-renders each page at 150 DPI and saves as compact JPEG. Big size reduction with very readable quality on screen and print.",
    tradeoff: "Good balance of size and quality",
  },
  {
    id: "strong",
    label: "Smallest size",
    icon: "📦",
    description: "Aggressive compression — pages re-rendered at 100 DPI with stronger JPEG. Ideal for emailing or sharing where size matters more than crispness.",
    tradeoff: "Maximum size reduction · screen-quality only",
  },
];

type LossyParams = {
  /** Render scale relative to PDF native (72 DPI). */
  dpi: number;
  /** JPEG quality (0..1). */
  quality: number;
};

const LOSSY_BY_LEVEL: Record<Exclude<CompressLevel, "lossless">, LossyParams> = {
  medium: { dpi: 150, quality: 0.78 },
  strong: { dpi: 100, quality: 0.55 },
};

/**
 * Compress a PDF in the browser.
 * - lossless: just resave with object-stream optimisation (preserves text)
 * - medium / strong: rasterise each page at a target DPI and embed as JPEG
 *   (much smaller, but text is no longer searchable)
 */
export async function compressPdf(
  bytes: Uint8Array,
  level: CompressLevel,
  onProgress?: (current: number, total: number) => void
): Promise<Uint8Array> {
  if (level === "lossless") {
    const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const out = await pdf.save({ useObjectStreams: true });
    return out;
  }

  const params = LOSSY_BY_LEVEL[level];
  const scale = params.dpi / 72;

  // pdf.js consumes its data buffer; give it its own copy.
  const pdfjsCopy = new Uint8Array(bytes.byteLength);
  pdfjsCopy.set(bytes);
  const pdfjsDoc = await pdfjsLib.getDocument({ data: pdfjsCopy }).promise;

  const newPdf = await PDFDocument.create();

  for (let i = 0; i < pdfjsDoc.numPages; i++) {
    onProgress?.(i, pdfjsDoc.numPages);

    const page = await pdfjsDoc.getPage(i + 1);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;

    // White background — JPEG can't represent transparency.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;

    const blob: Blob = await new Promise((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Could not encode JPEG"))),
        "image/jpeg",
        params.quality
      )
    );
    const jpegBytes = new Uint8Array(await blob.arrayBuffer());

    const image = await newPdf.embedJpg(jpegBytes);

    // Page size in PDF points (un-scaled).
    const pageWidthPt = canvas.width / scale;
    const pageHeightPt = canvas.height / scale;
    const newPage = newPdf.addPage([pageWidthPt, pageHeightPt]);
    newPage.drawImage(image, {
      x: 0,
      y: 0,
      width: pageWidthPt,
      height: pageHeightPt,
    });

    // Free memory eagerly between pages.
    canvas.width = 0;
    canvas.height = 0;
  }

  onProgress?.(pdfjsDoc.numPages, pdfjsDoc.numPages);

  return newPdf.save();
}

/** Format a byte count as a human string (e.g. "2.4 MB"). */
export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(2)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
