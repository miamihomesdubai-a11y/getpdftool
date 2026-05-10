import {
  PDFArray,
  PDFDocument,
  PDFName,
  PDFString,
  StandardFonts,
  degrees,
  rgb,
  type PDFEmbeddedPage,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import type {
  Annotation,
  FontFamily,
  LinkAnnotation,
  PageMeta,
  TextAnnotation,
} from "./types";

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const num = parseInt(h, 16);
  return {
    r: ((num >> 16) & 255) / 255,
    g: ((num >> 8) & 255) / 255,
    b: (num & 255) / 255,
  };
}

const c = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  return rgb(r, g, b);
};

/** Regular + bold variant for each base family. */
type FontMap = Record<FontFamily, { regular: PDFFont; bold: PDFFont }>;

const pickFont = (fonts: FontMap, t: TextAnnotation): PDFFont => {
  const family = fonts[t.fontFamily ?? "helvetica"] ?? fonts.helvetica;
  return t.bold ? family.bold : family.regular;
};

type ExportArgs = {
  /** Map of sourceId -> source PDF bytes. */
  sources: Map<string, Uint8Array>;
  pages: PageMeta[];
  annotations: Annotation[];
  /** Render scale used for the on-screen canvas (CSS px = PDF points × scale). */
  scale: number;
};

export async function exportEditedPdf({
  sources,
  pages,
  annotations,
  scale,
}: ExportArgs): Promise<Uint8Array> {
  const newPdf = await PDFDocument.create();

  const fonts: FontMap = {
    helvetica: {
      regular: await newPdf.embedFont(StandardFonts.Helvetica),
      bold: await newPdf.embedFont(StandardFonts.HelveticaBold),
    },
    times: {
      regular: await newPdf.embedFont(StandardFonts.TimesRoman),
      bold: await newPdf.embedFont(StandardFonts.TimesRomanBold),
    },
    courier: {
      regular: await newPdf.embedFont(StandardFonts.Courier),
      bold: await newPdf.embedFont(StandardFonts.CourierBold),
    },
  };

  // Pre-load each source PDF once.
  const sourceDocs = new Map<string, PDFDocument>();
  for (const [id, bytes] of sources.entries()) {
    sourceDocs.set(id, await PDFDocument.load(bytes));
  }

  const embedCache = new Map<string, PDFEmbeddedPage>();

  // We collect each new page + its rendered height (in PDF points) so the
  // post-pass can resolve "Link to page N" destinations and convert the
  // editor's CSS-pixel link rects into PDF-space rects.
  const newPages: { page: PDFPage; heightPt: number }[] = [];

  for (let i = 0; i < pages.length; i++) {
    const meta = pages[i];
    const sideways = meta.rotation === 90 || meta.rotation === 270;

    if (meta.kind === "blank") {
      const newW = sideways ? meta.height : meta.width;
      const newH = sideways ? meta.width : meta.height;
      const newPage = newPdf.addPage([newW, newH]);
      newPages.push({ page: newPage, heightPt: newH });
      const pageAnnotations = sortAnnotations(
        annotations.filter((a) => a.pageIndex === i)
      );
      for (const a of pageAnnotations) {
        if (a.type === "link") continue; // applied in second pass
        drawAnnotation(newPage, a, newH, scale, fonts);
      }
      continue;
    }

    // PDF-sourced page
    const cacheKey = `${meta.sourceId}:${meta.sourceIndex}`;
    let embedded = embedCache.get(cacheKey);
    if (!embedded) {
      const srcPdf = sourceDocs.get(meta.sourceId);
      if (!srcPdf) {
        throw new Error(`Source PDF "${meta.sourceId}" not loaded.`);
      }
      [embedded] = await newPdf.embedPdf(srcPdf, [meta.sourceIndex]);
      embedCache.set(cacheKey, embedded);
    }

    const origW = embedded.width;
    const origH = embedded.height;
    const newW = sideways ? origH : origW;
    const newH = sideways ? origW : origH;

    const newPage = newPdf.addPage([newW, newH]);
    newPages.push({ page: newPage, heightPt: newH });

    // Translation to keep the rotated page on the new canvas.
    let tx = 0;
    let ty = 0;
    switch (meta.rotation) {
      case 0:
        tx = 0;
        ty = 0;
        break;
      case 90:
        tx = 0;
        ty = origW;
        break;
      case 180:
        tx = origW;
        ty = origH;
        break;
      case 270:
        tx = origH;
        ty = 0;
        break;
    }

    newPage.drawPage(embedded, {
      x: tx,
      y: ty,
      rotate: degrees(-meta.rotation),
    });

    const pageAnnotations = sortAnnotations(
      annotations.filter((a) => a.pageIndex === i)
    );
    for (const a of pageAnnotations) {
      if (a.type === "link") continue; // applied in second pass
      drawAnnotation(newPage, a, newH, scale, fonts);
    }
  }

  // Second pass — write real PDF link annotations.
  for (const a of annotations) {
    if (a.type !== "link") continue;
    const target = newPages[a.pageIndex];
    if (!target) continue;
    addLinkAnnotation(newPdf, target.page, a, target.heightPt, scale, newPages);
  }

  return newPdf.save();
}

function addLinkAnnotation(
  pdf: PDFDocument,
  page: PDFPage,
  ann: LinkAnnotation,
  pageHeightPt: number,
  scale: number,
  newPages: { page: PDFPage; heightPt: number }[]
) {
  // Editor stores the rect in CSS-pixels with top-left origin.
  // Convert to PDF user-space (bottom-left origin, points).
  const x1 = ann.x / scale;
  const y2 = pageHeightPt - ann.y / scale;
  const x2 = (ann.x + ann.width) / scale;
  const y1 = pageHeightPt - (ann.y + ann.height) / scale;

  let action;
  if (ann.linkType === "url" && ann.url && ann.url.trim()) {
    let href = ann.url.trim();
    if (!/^[a-z][a-z0-9+\-.]*:/i.test(href)) {
      // Add a sensible scheme so PDF viewers actually open it.
      href = `https://${href}`;
    }
    action = pdf.context.obj({
      Type: "Action",
      S: "URI",
      URI: PDFString.of(href),
    });
  } else if (ann.linkType === "email" && ann.email && ann.email.trim()) {
    action = pdf.context.obj({
      Type: "Action",
      S: "URI",
      URI: PDFString.of(`mailto:${ann.email.trim()}`),
    });
  } else if (ann.linkType === "phone" && ann.phone && ann.phone.trim()) {
    const cleaned = ann.phone.replace(/[^\d+]/g, "");
    action = pdf.context.obj({
      Type: "Action",
      S: "URI",
      URI: PDFString.of(`tel:${cleaned}`),
    });
  } else if (
    ann.linkType === "page" &&
    ann.pageNumber != null &&
    ann.pageNumber >= 1 &&
    ann.pageNumber <= newPages.length
  ) {
    const target = newPages[ann.pageNumber - 1];
    action = pdf.context.obj({
      Type: "Action",
      S: "GoTo",
      D: [target.page.ref, PDFName.of("Fit")],
    });
  }

  if (!action) return; // ignore links with no target

  const linkObj = pdf.context.obj({
    Type: "Annot",
    Subtype: "Link",
    Rect: [x1, y1, x2, y2],
    // No visible border — most viewers add a hand cursor + highlight on hover.
    Border: [0, 0, 0],
    A: action,
  });
  const linkRef = pdf.context.register(linkObj);

  const existing = page.node.lookupMaybe(PDFName.of("Annots"), PDFArray);
  if (existing) {
    existing.push(linkRef);
  } else {
    page.node.set(PDFName.of("Annots"), pdf.context.obj([linkRef]));
  }
}

/**
 * Whiteouts must be drawn before any other annotation so subsequent text
 * sits ON TOP of the white box.
 */
function sortAnnotations(arr: Annotation[]): Annotation[] {
  return [...arr].sort((a, b) => {
    const aw = a.type === "whiteout" ? 0 : 1;
    const bw = b.type === "whiteout" ? 0 : 1;
    return aw - bw;
  });
}

function drawAnnotation(
  page: PDFPage,
  a: Annotation,
  pageHeightPt: number,
  scale: number,
  fonts: FontMap
) {
  switch (a.type) {
    case "text": {
      const sizePt = a.fontSize / scale;
      const lineHeight = sizePt * 1.15;
      const lines = a.text.split("\n");
      const font = pickFont(fonts, a);
      lines.forEach((line, i) => {
        if (!line) return;
        const lineX = a.x / scale;
        const baselineY =
          pageHeightPt - a.y / scale - sizePt * 0.85 - i * lineHeight;
        page.drawText(line, {
          x: lineX,
          y: baselineY,
          size: sizePt,
          font,
          color: c(a.color),
        });
        if (a.underline) {
          const lineWidth = font.widthOfTextAtSize(line, sizePt);
          // Underline a few percent below baseline.
          const underlineY = baselineY - sizePt * 0.12;
          page.drawLine({
            start: { x: lineX, y: underlineY },
            end: { x: lineX + lineWidth, y: underlineY },
            thickness: Math.max(0.5, sizePt * 0.06),
            color: c(a.color),
          });
        }
      });
      break;
    }
    case "draw": {
      if (a.points.length < 2) return;
      const thickness = a.strokeWidth / scale;
      const color = c(a.color);
      for (let i = 1; i < a.points.length; i++) {
        const p1 = a.points[i - 1];
        const p2 = a.points[i];
        page.drawLine({
          start: { x: p1.x / scale, y: pageHeightPt - p1.y / scale },
          end: { x: p2.x / scale, y: pageHeightPt - p2.y / scale },
          thickness,
          color,
        });
      }
      break;
    }
    case "highlight": {
      page.drawRectangle({
        x: a.x / scale,
        y: pageHeightPt - (a.y + a.height) / scale,
        width: a.width / scale,
        height: a.height / scale,
        color: c(a.color),
        opacity: 0.35,
        borderWidth: 0,
      });
      break;
    }
    case "rectangle": {
      page.drawRectangle({
        x: a.x / scale,
        y: pageHeightPt - (a.y + a.height) / scale,
        width: a.width / scale,
        height: a.height / scale,
        borderColor: c(a.color),
        borderWidth: a.strokeWidth / scale,
      });
      break;
    }
    case "whiteout": {
      page.drawRectangle({
        x: a.x / scale,
        y: pageHeightPt - (a.y + a.height) / scale,
        width: a.width / scale,
        height: a.height / scale,
        color: rgb(1, 1, 1),
        opacity: 1,
        borderWidth: 0,
      });
      break;
    }
    case "mark": {
      const xPt = a.x / scale;
      const yTopPt = pageHeightPt - a.y / scale;
      const wPt = a.width / scale;
      const hPt = a.height / scale;
      const thickness = Math.max(0.5, a.strokeWidth / scale);
      const color = c(a.color);
      if (a.shape === "cross") {
        // Two diagonals.
        page.drawLine({
          start: { x: xPt, y: yTopPt },
          end: { x: xPt + wPt, y: yTopPt - hPt },
          thickness,
          color,
        });
        page.drawLine({
          start: { x: xPt + wPt, y: yTopPt },
          end: { x: xPt, y: yTopPt - hPt },
          thickness,
          color,
        });
      } else {
        // Check mark: short stroke down-right, then long stroke up-right.
        const p1 = { x: xPt + wPt * 0.15, y: yTopPt - hPt * 0.55 };
        const p2 = { x: xPt + wPt * 0.4, y: yTopPt - hPt * 0.85 };
        const p3 = { x: xPt + wPt * 0.85, y: yTopPt - hPt * 0.15 };
        page.drawLine({ start: p1, end: p2, thickness, color });
        page.drawLine({ start: p2, end: p3, thickness, color });
      }
      break;
    }
  }
}
