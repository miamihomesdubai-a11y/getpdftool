"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import { pdfjsLib } from "@/lib/pdfWorker";
import { downloadFile, printFile, shareFile } from "@/lib/fileActions";

const SCALE = 1.5;
const MARGIN_PT = 36; // 0.5 inch from page edges

type Mode = "text" | "image";
type FontFamily = "helvetica" | "times" | "courier";
type Position =
  | "tl"
  | "tc"
  | "tr"
  | "ml"
  | "c"
  | "mr"
  | "bl"
  | "bc"
  | "br";

const FONT_LABELS: Record<FontFamily, string> = {
  helvetica: "Sans Serif",
  times: "Serif",
  courier: "Monospace",
};

const FONT_CSS: Record<FontFamily, string> = {
  helvetica: 'Helvetica, Arial, "Liberation Sans", sans-serif',
  times: '"Times New Roman", Times, "Liberation Serif", serif',
  courier: '"Courier New", Courier, "Liberation Mono", monospace',
};

const POSITION_GRID: Position[] = [
  "tl", "tc", "tr",
  "ml", "c",  "mr",
  "bl", "bc", "br",
];

const POSITION_LABEL: Record<Position, string> = {
  tl: "Top left",
  tc: "Top",
  tr: "Top right",
  ml: "Middle left",
  c: "Centre",
  mr: "Middle right",
  bl: "Bottom left",
  bc: "Bottom",
  br: "Bottom right",
};

type ImageWm = {
  dataUrl: string;
  mime: "image/png" | "image/jpeg";
  naturalWidth: number;
  naturalHeight: number;
};

export default function WatermarkTool() {
  // PDF state
  const [sourceBytes, setSourceBytes] = useState<Uint8Array | null>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [fileName, setFileName] = useState("");
  const [hasOpened, setHasOpened] = useState(false);

  // Mode + watermark settings
  const [mode, setMode] = useState<Mode>("text");

  // Text watermark
  const [text, setText] = useState("DRAFT");
  const [fontFamily, setFontFamily] = useState<FontFamily>("helvetica");
  const [fontSizePt, setFontSizePt] = useState(96);
  const [bold, setBold] = useState(true);
  const [color, setColor] = useState("#dc2626");

  // Image watermark
  const [image, setImage] = useState<ImageWm | null>(null);
  const [imageWidthPct, setImageWidthPct] = useState(40);

  // Common
  const [opacity, setOpacity] = useState(0.3);
  const [rotation, setRotation] = useState(30); // degrees, CCW positive
  const [position, setPosition] = useState<Position>("c");

  // Apply pages
  const [applyAll, setApplyAll] = useState(true);
  const [pageFrom, setPageFrom] = useState(1);
  const [pageTo, setPageTo] = useState(1);

  // Saved file
  const [savedBytes, setSavedBytes] = useState<Uint8Array | null>(null);
  const [savedFileName, setSavedFileName] = useState("");
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Reset saved bytes whenever the watermark would visually change.
  useEffect(() => {
    setSavedBytes(null);
  }, [
    mode,
    text,
    fontFamily,
    fontSizePt,
    bold,
    color,
    image,
    imageWidthPct,
    opacity,
    rotation,
    position,
    applyAll,
    pageFrom,
    pageTo,
    sourceBytes,
  ]);

  // --- File loading ---

  const loadInitialFile = async (file: File) => {
    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Please choose a PDF file.");
      return;
    }
    setError(null);
    try {
      const buf = await file.arrayBuffer();
      const sourceCopy = new Uint8Array(buf.slice(0));
      const pdfjsCopy = new Uint8Array(buf.slice(0));
      const doc = await pdfjsLib.getDocument({ data: pdfjsCopy }).promise;
      setSourceBytes(sourceCopy);
      setPdf(doc);
      setPageCount(doc.numPages);
      setPageFrom(1);
      setPageTo(doc.numPages);
      setFileName(file.name);
      setHasOpened(true);
    } catch (err) {
      console.error(err);
      setError(
        "Could not open that PDF. It may be password-protected or damaged."
      );
    }
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) loadInitialFile(f);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) loadInitialFile(f);
  };

  const onImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    const isPng = f.type === "image/png" || /\.png$/i.test(f.name);
    const isJpg = f.type === "image/jpeg" || /\.jpe?g$/i.test(f.name);
    if (!isPng && !isJpg) {
      setError("Please choose a PNG or JPEG image.");
      return;
    }
    setError(null);
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = () => reject(new Error("Could not read the image."));
      r.readAsDataURL(f);
    });
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Could not load the image."));
      img.src = dataUrl;
    });
    setImage({
      dataUrl,
      mime: isPng ? "image/png" : "image/jpeg",
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
    });
  };

  const reset = () => {
    if (hasOpened && !confirm("Discard the current PDF and start over?"))
      return;
    setSourceBytes(null);
    setPdf(null);
    setPageCount(0);
    setFileName("");
    setHasOpened(false);
    setSavedBytes(null);
    setError(null);
    setImage(null);
  };

  // --- Apply watermark on save ---

  const applyTo = (i: number /* zero-indexed page */) => {
    if (applyAll) return true;
    const from = Math.max(1, Math.min(pageCount, pageFrom));
    const to = Math.max(1, Math.min(pageCount, pageTo));
    const lo = Math.min(from, to);
    const hi = Math.max(from, to);
    return i + 1 >= lo && i + 1 <= hi;
  };

  const saveChanges = async () => {
    if (!sourceBytes) return;
    if (mode === "text" && !text.trim()) {
      setError("Type some watermark text first.");
      return;
    }
    if (mode === "image" && !image) {
      setError("Upload an image to use as a watermark.");
      return;
    }
    setExporting(true);
    setError(null);
    try {
      const pdfDoc = await PDFDocument.load(sourceBytes);
      const pages = pdfDoc.getPages();

      // Pre-load font (text mode) or image (image mode).
      let pdfFont: Awaited<ReturnType<PDFDocument["embedFont"]>> | null = null;
      let pdfImage: Awaited<ReturnType<PDFDocument["embedPng"]>> | null = null;
      if (mode === "text") {
        const std =
          fontFamily === "helvetica"
            ? bold
              ? StandardFonts.HelveticaBold
              : StandardFonts.Helvetica
            : fontFamily === "times"
              ? bold
                ? StandardFonts.TimesRomanBold
                : StandardFonts.TimesRoman
              : bold
                ? StandardFonts.CourierBold
                : StandardFonts.Courier;
        pdfFont = await pdfDoc.embedFont(std);
      } else if (image) {
        const bytes = await fetch(image.dataUrl).then((r) => r.arrayBuffer());
        pdfImage =
          image.mime === "image/png"
            ? await pdfDoc.embedPng(bytes)
            : await pdfDoc.embedJpg(bytes);
      }

      const θ = (rotation * Math.PI) / 180;
      const cosθ = Math.cos(θ);
      const sinθ = Math.sin(θ);

      for (let i = 0; i < pages.length; i++) {
        if (!applyTo(i)) continue;
        const page = pages[i];
        const { width: pw, height: ph } = page.getSize();

        let ww = 0;
        let wh = 0;
        if (mode === "text" && pdfFont) {
          ww = pdfFont.widthOfTextAtSize(text, fontSizePt);
          wh = fontSizePt;
        } else if (mode === "image" && image && pdfImage) {
          ww = (pw * imageWidthPct) / 100;
          wh = ww * (image.naturalHeight / image.naturalWidth);
        }

        const [cx, cy] = centreFor(position, pw, ph, ww, wh);

        // Anchor offset so the watermark CENTRE lands at (cx, cy) after rotation.
        const dx = (ww / 2) * cosθ - (wh / 2) * sinθ;
        const dy = (ww / 2) * sinθ + (wh / 2) * cosθ;
        const anchorX = cx - dx;
        const anchorY = cy - dy;

        if (mode === "text" && pdfFont) {
          const { r, g, b } = hexToRgb(color);
          page.drawText(text, {
            x: anchorX,
            y: anchorY,
            size: fontSizePt,
            font: pdfFont,
            color: rgb(r, g, b),
            rotate: degrees(rotation),
            opacity,
          });
        } else if (mode === "image" && pdfImage) {
          page.drawImage(pdfImage, {
            x: anchorX,
            y: anchorY,
            width: ww,
            height: wh,
            rotate: degrees(rotation),
            opacity,
          });
        }
      }

      const out = await pdfDoc.save();
      const base = fileName.replace(/\.pdf$/i, "") || "watermarked";
      setSavedBytes(out);
      setSavedFileName(`${base}-watermarked.pdf`);
    } catch (err) {
      console.error(err);
      setError("Could not apply the watermark. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  // --- Download / Print / Share ---

  const downloadSavedFile = () => {
    if (!savedBytes) return;
    downloadFile(savedBytes, savedFileName || "watermarked.pdf");
  };

  const printSavedFile = () => {
    if (!savedBytes) return;
    const err = printFile(savedBytes, savedFileName || "watermarked.pdf");
    if (err) setError(err);
  };

  const shareSavedFile = async () => {
    if (!savedBytes) return;
    const err = await shareFile(
      savedBytes,
      savedFileName || "watermarked.pdf",
      "Watermarked with GetPDFTool"
    );
    if (err) setError(err);
  };

  // ===== Render =====

  if (!hasOpened) {
    return (
      <div className="container-narrow py-10">
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className="rounded-3xl border-2 border-dashed border-brand-200 bg-white/60 p-10 text-center shadow-soft transition hover:border-brand-400 hover:bg-brand-50/60"
        >
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-2xl text-white shadow-soft">
            🌊
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Drop a PDF to watermark it
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or pick one from your computer. Everything happens in your
            browser — your file is never uploaded.
          </p>
          <div className="mt-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={onFileInput}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary"
            >
              Choose PDF file
            </button>
          </div>
          {error && (
            <p className="mt-4 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container-narrow py-6">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/png,image/jpeg,.png,.jpg,.jpeg"
        className="hidden"
        onChange={onImagePick}
      />

      {/* Settings panel */}
      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Original file
            </p>
            <p className="mt-1 text-base font-semibold text-gray-900">
              📄 {fileName}{" "}
              <span className="font-normal text-gray-500">
                · {pageCount} page{pageCount === 1 ? "" : "s"}
              </span>
            </p>
          </div>
          <button type="button" onClick={reset} className="btn-ghost">
            ✕ Choose another file
          </button>
        </div>

        {/* Mode tabs */}
        <div className="mt-5 inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1 text-xs">
          {(["text", "image"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-md px-3 py-1.5 font-medium transition ${
                mode === m
                  ? "bg-white text-brand-700 shadow"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {m === "text" ? "Text watermark" : "Image watermark"}
            </button>
          ))}
        </div>

        {/* Text settings */}
        {mode === "text" && (
          <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr,1fr]">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Watermark text
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="DRAFT, CONFIDENTIAL, COPY…"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Font
                  </label>
                  <select
                    value={fontFamily}
                    onChange={(e) =>
                      setFontFamily(e.target.value as FontFamily)
                    }
                    className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm"
                  >
                    {(Object.keys(FONT_LABELS) as FontFamily[]).map((f) => (
                      <option key={f} value={f}>
                        {FONT_LABELS[f]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Size (pt)
                  </label>
                  <input
                    type="number"
                    min={8}
                    max={400}
                    value={fontSizePt}
                    onChange={(e) =>
                      setFontSizePt(Math.max(8, Number(e.target.value) || 8))
                    }
                    className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm"
                  />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={bold}
                    onChange={(e) => setBold(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-brand-600"
                  />
                  <span className="font-medium text-gray-700">Bold</span>
                </label>
                <span className="font-medium text-gray-600">Colour</span>
                {[
                  "#dc2626",
                  "#0f172a",
                  "#6b7280",
                  "#1d4ed8",
                  "#15803d",
                ].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-5 w-5 rounded-full border-2 ${
                      color === c
                        ? "border-brand-500 ring-2 ring-brand-200"
                        : "border-gray-200"
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={c}
                  />
                ))}
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-6 w-8 cursor-pointer rounded border border-gray-200"
                />
              </div>
            </div>
            <CommonSettings
              opacity={opacity}
              setOpacity={setOpacity}
              rotation={rotation}
              setRotation={setRotation}
              position={position}
              setPosition={setPosition}
              applyAll={applyAll}
              setApplyAll={setApplyAll}
              pageFrom={pageFrom}
              setPageFrom={setPageFrom}
              pageTo={pageTo}
              setPageTo={setPageTo}
              pageCount={pageCount}
            />
          </div>
        )}

        {/* Image settings */}
        {mode === "image" && (
          <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr,1fr]">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Watermark image
              </label>
              {image ? (
                <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
                  <img
                    src={image.dataUrl}
                    alt="Watermark preview"
                    className="max-h-16"
                  />
                  <div className="text-xs text-gray-600">
                    {image.naturalWidth} × {image.naturalHeight}px ·{" "}
                    {image.mime === "image/png" ? "PNG" : "JPEG"}
                  </div>
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="ml-auto rounded-md border border-gray-200 px-2 py-1 text-xs hover:border-brand-300"
                  >
                    Change…
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="rounded-lg border-2 border-dashed border-gray-200 bg-white px-4 py-6 text-sm text-gray-600 hover:border-brand-300"
                >
                  Choose PNG / JPEG image
                </button>
              )}
              <div className="mt-3">
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Width: {imageWidthPct}% of page
                </label>
                <input
                  type="range"
                  min={5}
                  max={100}
                  value={imageWidthPct}
                  onChange={(e) => setImageWidthPct(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
            <CommonSettings
              opacity={opacity}
              setOpacity={setOpacity}
              rotation={rotation}
              setRotation={setRotation}
              position={position}
              setPosition={setPosition}
              applyAll={applyAll}
              setApplyAll={setApplyAll}
              pageFrom={pageFrom}
              setPageFrom={setPageFrom}
              pageTo={pageTo}
              setPageTo={setPageTo}
              pageCount={pageCount}
            />
          </div>
        )}

        {/* Action row */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-500">
            Live preview is shown below. The watermark is baked into the saved
            PDF.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={saveChanges}
              disabled={exporting || !!savedBytes}
              className="btn-primary"
            >
              {exporting
                ? "Saving…"
                : savedBytes
                  ? "✓ Saved"
                  : "💾 Save Changes"}
            </button>
            {savedBytes && (
              <div className="flex items-stretch overflow-hidden rounded-xl bg-emerald-600 text-white shadow-soft">
                <button
                  type="button"
                  onClick={downloadSavedFile}
                  className="flex items-center gap-1.5 px-4 py-3 text-sm font-semibold transition hover:bg-emerald-700"
                  title="Download to your computer"
                >
                  ↓ Download
                </button>
                <button
                  type="button"
                  onClick={printSavedFile}
                  className="flex items-center gap-1.5 border-l border-emerald-500 px-3 py-3 text-sm font-semibold transition hover:bg-emerald-700"
                  title="Open the PDF and print it"
                >
                  🖨 Print
                </button>
                <button
                  type="button"
                  onClick={shareSavedFile}
                  className="flex items-center gap-1.5 border-l border-emerald-500 px-3 py-3 text-sm font-semibold transition hover:bg-emerald-700"
                  title="Share via WhatsApp / Mail / system share menu"
                >
                  📤 Share
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div
          className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="flex flex-col items-center gap-6">
        {pdf &&
          Array.from({ length: pageCount }).map((_, i) => (
            <PreviewPage
              key={i}
              pdf={pdf}
              pageIndex={i}
              shouldShowWatermark={applyTo(i)}
              mode={mode}
              text={text}
              fontFamily={fontFamily}
              fontSizePt={fontSizePt}
              bold={bold}
              color={color}
              image={image}
              imageWidthPct={imageWidthPct}
              opacity={opacity}
              rotation={rotation}
              position={position}
            />
          ))}
      </div>
    </div>
  );
}

// =============================================================================

function CommonSettings(props: {
  opacity: number;
  setOpacity: (v: number) => void;
  rotation: number;
  setRotation: (v: number) => void;
  position: Position;
  setPosition: (p: Position) => void;
  applyAll: boolean;
  setApplyAll: (v: boolean) => void;
  pageFrom: number;
  setPageFrom: (v: number) => void;
  pageTo: number;
  setPageTo: (v: number) => void;
  pageCount: number;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 flex items-center justify-between text-xs font-medium text-gray-700">
          <span>Opacity</span>
          <span className="text-gray-500">
            {Math.round(props.opacity * 100)}%
          </span>
        </label>
        <input
          type="range"
          min={5}
          max={100}
          value={Math.round(props.opacity * 100)}
          onChange={(e) => props.setOpacity(Number(e.target.value) / 100)}
          className="w-full"
        />
      </div>
      <div>
        <label className="mb-1 flex items-center justify-between text-xs font-medium text-gray-700">
          <span>Rotation</span>
          <span className="text-gray-500">{props.rotation}°</span>
        </label>
        <input
          type="range"
          min={-90}
          max={90}
          value={props.rotation}
          onChange={(e) => props.setRotation(Number(e.target.value))}
          className="w-full"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          Position
        </label>
        <div className="grid w-fit grid-cols-3 gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
          {POSITION_GRID.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => props.setPosition(p)}
              title={POSITION_LABEL[p]}
              className={`grid h-7 w-7 place-items-center rounded text-xs font-semibold transition ${
                props.position === p
                  ? "bg-brand-600 text-white"
                  : "bg-white text-gray-500 hover:bg-brand-50 hover:text-brand-700"
              }`}
            >
              ●
            </button>
          ))}
        </div>
      </div>
      <div className="text-xs">
        <label className="mb-1 block font-medium text-gray-700">Pages</label>
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex items-center gap-1">
            <input
              type="radio"
              checked={props.applyAll}
              onChange={() => props.setApplyAll(true)}
              className="text-brand-600"
            />
            <span>All pages</span>
          </label>
          <label className="inline-flex items-center gap-1">
            <input
              type="radio"
              checked={!props.applyAll}
              onChange={() => props.setApplyAll(false)}
              className="text-brand-600"
            />
            <span>Range</span>
          </label>
          {!props.applyAll && (
            <span className="inline-flex items-center gap-1">
              <input
                type="number"
                min={1}
                max={props.pageCount}
                value={props.pageFrom}
                onChange={(e) => props.setPageFrom(Number(e.target.value))}
                className="w-14 rounded-md border border-gray-200 px-1.5 py-1 text-xs"
              />
              <span>to</span>
              <input
                type="number"
                min={1}
                max={props.pageCount}
                value={props.pageTo}
                onChange={(e) => props.setPageTo(Number(e.target.value))}
                className="w-14 rounded-md border border-gray-200 px-1.5 py-1 text-xs"
              />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================

type PreviewPageProps = {
  pdf: PDFDocumentProxy;
  pageIndex: number;
  shouldShowWatermark: boolean;
  mode: Mode;
  text: string;
  fontFamily: FontFamily;
  fontSizePt: number;
  bold: boolean;
  color: string;
  image: ImageWm | null;
  imageWidthPct: number;
  opacity: number;
  rotation: number;
  position: Position;
};

function PreviewPage(props: PreviewPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState<{ w: number; h: number; pwPt: number; phPt: number } | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;
    let task: { promise: Promise<void>; cancel: () => void } | null = null;
    (async () => {
      const page = await props.pdf.getPage(props.pageIndex + 1);
      const viewport = page.getViewport({ scale: SCALE });
      if (cancelled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      setSize({
        w: viewport.width,
        h: viewport.height,
        pwPt: viewport.width / SCALE,
        phPt: viewport.height / SCALE,
      });
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      task = page.render({ canvasContext: ctx, viewport });
      try {
        await task.promise;
      } catch {
        /* cancelled */
      }
    })();
    return () => {
      cancelled = true;
      if (task) {
        try {
          task.cancel();
        } catch {
          /* noop */
        }
      }
    };
  }, [props.pdf, props.pageIndex]);

  const overlay = useMemo(() => {
    if (!size) return null;
    if (!props.shouldShowWatermark) return null;

    const { w: cw, h: ch, pwPt, phPt } = size;

    let wwPt = 0;
    let whPt = 0;
    if (props.mode === "text" && props.text) {
      // Approximate width using a 2D canvas measureText.
      const measure = document.createElement("canvas").getContext("2d");
      if (!measure) return null;
      measure.font = `${props.bold ? "bold " : ""}${props.fontSizePt}px ${
        FONT_CSS[props.fontFamily]
      }`;
      const m = measure.measureText(props.text);
      wwPt = m.width;
      whPt = props.fontSizePt;
    } else if (props.mode === "image" && props.image) {
      wwPt = (pwPt * props.imageWidthPct) / 100;
      whPt = wwPt * (props.image.naturalHeight / props.image.naturalWidth);
    } else {
      return null;
    }

    const [cxPt, cyPt] = centreFor(props.position, pwPt, phPt, wwPt, whPt);

    // Convert PDF coords → CSS coords. PDF y increases up, CSS y increases down.
    const cxCss = cxPt * SCALE;
    const cyCss = (phPt - cyPt) * SCALE;
    const wwCss = wwPt * SCALE;
    const whCss = whPt * SCALE;

    return {
      cxCss,
      cyCss,
      wwCss,
      whCss,
    };
  }, [size, props]);

  return (
    <div className="relative inline-block">
      <div className="mb-2 text-xs text-gray-500">
        Page {props.pageIndex + 1}
      </div>
      <div className="pdf-page-wrapper">
        <canvas ref={canvasRef} />
        {overlay && size && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{ width: size.w, height: size.h }}
          >
            <div
              style={{
                position: "absolute",
                left: overlay.cxCss - overlay.wwCss / 2,
                top: overlay.cyCss - overlay.whCss / 2,
                width: overlay.wwCss,
                height: overlay.whCss,
                opacity: props.opacity,
                // CSS rotation is clockwise positive; flip sign so it matches
                // pdf-lib's counter-clockwise convention.
                transform: `rotate(${-props.rotation}deg)`,
                transformOrigin: "50% 50%",
                display: "flex",
                alignItems: "center",
                justifyContent: props.mode === "text" ? "flex-start" : "center",
              }}
            >
              {props.mode === "text" ? (
                <span
                  style={{
                    fontFamily: FONT_CSS[props.fontFamily],
                    fontWeight: props.bold ? 700 : 400,
                    fontSize: props.fontSizePt * SCALE,
                    color: props.color,
                    whiteSpace: "nowrap",
                    lineHeight: 1,
                  }}
                >
                  {props.text}
                </span>
              ) : props.image ? (
                <img
                  src={props.image.dataUrl}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "fill",
                  }}
                />
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================

function centreFor(
  position: Position,
  pageWPt: number,
  pageHPt: number,
  wwPt: number,
  whPt: number
): [number, number] {
  const margin = MARGIN_PT;
  const cxLeft = margin + wwPt / 2;
  const cxCentre = pageWPt / 2;
  const cxRight = pageWPt - margin - wwPt / 2;
  const cyTop = pageHPt - margin - whPt / 2;
  const cyMiddle = pageHPt / 2;
  const cyBottom = margin + whPt / 2;

  switch (position) {
    case "tl":
      return [cxLeft, cyTop];
    case "tc":
      return [cxCentre, cyTop];
    case "tr":
      return [cxRight, cyTop];
    case "ml":
      return [cxLeft, cyMiddle];
    case "c":
      return [cxCentre, cyMiddle];
    case "mr":
      return [cxRight, cyMiddle];
    case "bl":
      return [cxLeft, cyBottom];
    case "bc":
      return [cxCentre, cyBottom];
    case "br":
      return [cxRight, cyBottom];
  }
}

function hexToRgb(hex: string) {
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
