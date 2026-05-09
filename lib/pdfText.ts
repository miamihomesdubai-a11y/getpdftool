"use client";

import type { PDFDocumentProxy } from "pdfjs-dist";
import { pdfjsLib } from "./pdfWorker";
import type { Rotation } from "./types";

/** A single text run, in display CSS pixels (top-left origin). */
export type TextItem = {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

/** A search-result match across a document. */
export type SearchMatch = {
  /** Display-page index (in `pages` array). */
  pageIndex: number;
  /** Index of the source text item on that page (within its TextItem[] array). */
  itemIndex: number;
  /** Character offset within the text item's string. */
  charOffset: number;
  /** Length of the matched substring. */
  charLength: number;
  /** Bounding box in display CSS pixels. */
  x: number;
  y: number;
  width: number;
  height: number;
  /** The actual matched text (preserves original casing). */
  matchedText: string;
};

/** Extract every text run from a PDF page, in display coordinates. */
export async function extractPageText(
  pdf: PDFDocumentProxy,
  sourceIndex: number,
  rotation: Rotation,
  scale: number
): Promise<TextItem[]> {
  const page = await pdf.getPage(sourceIndex + 1);
  const viewport = page.getViewport({ scale, rotation });
  const content = await page.getTextContent();
  const items: TextItem[] = [];

  for (const raw of content.items) {
    const it = raw as {
      str?: string;
      width?: number;
      height?: number;
      transform?: number[];
    };
    if (!it.str || !it.transform) continue;

    // Multiply page viewport transform by item transform to get the text
    // baseline position in canvas (top-left origin) coordinates.
    const tx = pdfjsLib.Util.transform(viewport.transform, it.transform);
    const fontHeight = Math.hypot(tx[2], tx[3]) || 12;
    const widthPx = (it.width ?? 0) * scale;
    const heightPx = fontHeight;
    items.push({
      str: it.str,
      x: tx[4],
      y: tx[5] - heightPx, // baseline → top
      width: widthPx,
      height: heightPx,
    });
  }

  return items;
}

/** Detect whether a PDF page contains a meaningful text layer. */
export async function detectPageType(
  pdf: PDFDocumentProxy,
  sourceIndex: number
): Promise<"text" | "scanned"> {
  try {
    const page = await pdf.getPage(sourceIndex + 1);
    const content = await page.getTextContent();
    const total = content.items
      .map((i) => ("str" in i ? (i as { str: string }).str : ""))
      .join("")
      .trim();
    return total.length >= 10 ? "text" : "scanned";
  } catch {
    return "scanned";
  }
}

/**
 * Find every match of `query` inside the given page text items.
 * Each match's bounding box is approximated by character width
 * (item.width / item.str.length) — exact for monospace, close enough
 * for proportional fonts at typical sizes.
 */
export function findMatchesInPage(
  pageIndex: number,
  items: TextItem[],
  query: string,
  matchCase: boolean
): SearchMatch[] {
  if (!query) return [];
  const matches: SearchMatch[] = [];
  const q = matchCase ? query : query.toLowerCase();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.str) continue;
    const haystack = matchCase ? item.str : item.str.toLowerCase();
    let from = 0;
    while ((from = haystack.indexOf(q, from)) !== -1) {
      const charWidth = item.str.length > 0 ? item.width / item.str.length : 0;
      const x = item.x + from * charWidth;
      const width = q.length * charWidth;
      const matchedText = item.str.substr(from, q.length);
      matches.push({
        pageIndex,
        itemIndex: i,
        charOffset: from,
        charLength: q.length,
        x,
        y: item.y,
        width: width || item.height * 0.6,
        height: item.height,
        matchedText,
      });
      from += q.length;
    }
  }
  return matches;
}
