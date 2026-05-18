import {
  PDFDocument,
  StandardFonts,
  degrees,
  rgb,
  type PDFEmbeddedPage,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import type {
  Annotation,
  FontFamily,
  PageMeta,
  TextAnnotation,
} from "./types";

/**
 * Cache for fetched custom-font bytes. Browser hits /public/fonts/*.ttf
 * once per session; subsequent exports reuse the ArrayBuffer.
 */
const customFontCache = new Map<string, Promise<ArrayBuffer>>();

async function loadCustomFont(path: string): Promise<ArrayBuffer> {
  let p = customFontCache.get(path);
  if (!p) {
    p = fetch(path).then((r) => {
      if (!r.ok) throw new Error(`Could not load font ${path}`);
      return r.arrayBuffer();
    });
    customFontCache.set(path, p);
  }
  return p;
}

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
  // fontkit is required to embed any non-StandardFont (Roboto / Poppins
  // are TTF assets shipped from /public/fonts).
  newPdf.registerFontkit(fontkit);

  // Standard fonts cost nothing — always embed them.
  const helveticaPair = {
    regular: await newPdf.embedFont(StandardFonts.Helvetica),
    bold: await newPdf.embedFont(StandardFonts.HelveticaBold),
  };
  const timesPair = {
    regular: await newPdf.embedFont(StandardFonts.TimesRoman),
    bold: await newPdf.embedFont(StandardFonts.TimesRomanBold),
  };
  const courierPair = {
    regular: await newPdf.embedFont(StandardFonts.Courier),
    bold: await newPdf.embedFont(StandardFonts.CourierBold),
  };

  // Custom Google Fonts — only embedded when actually used by a text
  // annotation, so vanilla PDFs stay small.
  let robotoPair = helveticaPair;
  let poppinsPair = helveticaPair;
  const usesRoboto = annotations.some(
    (a) => a.type === "text" && a.fontFamily === "roboto"
  );
  const usesPoppins = annotations.some(
    (a) => a.type === "text" && a.fontFamily === "poppins"
  );
  if (usesRoboto) {
    const [reg, bold] = await Promise.all([
      loadCustomFont("/fonts/Roboto-Regular.ttf"),
      loadCustomFont("/fonts/Roboto-Bold.ttf"),
    ]);
    robotoPair = {
      regular: await newPdf.embedFont(reg, { subset: true }),
      bold: await newPdf.embedFont(bold, { subset: true }),
    };
  }
  if (usesPoppins) {
    const [reg, bold] = await Promise.all([
      loadCustomFont("/fonts/Poppins-Regular.ttf"),
      loadCustomFont("/fonts/Poppins-Bold.ttf"),
    ]);
    poppinsPair = {
      regular: await newPdf.embedFont(reg, { subset: true }),
      bold: await newPdf.embedFont(bold, { subset: true }),
    };
  }

  const fonts: FontMap = {
    helvetica: helveticaPair,
    times: timesPair,
    courier: courierPair,
    roboto: robotoPair,
    poppins: poppinsPair,
  };

  // Pre-load each source PDF once.
  const sourceDocs = new Map<string, PDFDocument>();
  for (const [id, bytes] of sources.entries()) {
    sourceDocs.set(id, await PDFDocument.load(bytes));
  }

  const embedCache = new Map<string, PDFEmbeddedPage>();

  for (let i = 0; i < pages.length; i++) {
    const meta = pages[i];
    const sideways = meta.rotation === 90 || meta.rotation === 270;

    if (meta.kind === "blank") {
      const newW = sideways ? meta.height : meta.width;
      const newH = sideways ? meta.width : meta.height;
      const newPage = newPdf.addPage([newW, newH]);
      const pageAnnotations = sortAnnotations(
        annotations.filter((a) => a.pageIndex === i)
      );
      for (const a of pageAnnotations) {
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
      drawAnnotation(newPage, a, newH, scale, fonts);
    }
  }

  return newPdf.save();
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
      // The editor renders text inside a 1px border + 1px/4px padding inset
      // (so active/inactive states don't jump). Mirror that here so the
      // exported PDF lines up with what the user saw in the editor.
      const insetXPt = 5 / scale;
      const insetYPt = 2 / scale;
      lines.forEach((line, i) => {
        if (!line) return;
        const lineX = a.x / scale + insetXPt;
        const baselineY =
          pageHeightPt -
          a.y / scale -
          insetYPt -
          sizePt * 0.85 -
          i * lineHeight;
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
      const fillColor = a.color ? c(a.color) : rgb(1, 1, 1);
      page.drawRectangle({
        x: a.x / scale,
        y: pageHeightPt - (a.y + a.height) / scale,
        width: a.width / scale,
        height: a.height / scale,
        color: fillColor,
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
