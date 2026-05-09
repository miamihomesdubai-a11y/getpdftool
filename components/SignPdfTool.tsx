"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { pdfjsLib } from "@/lib/pdfWorker";
import SignatureSourceModal, {
  type SignatureImage,
} from "./SignatureSourceModal";

const SCALE = 1.5;

// ----- Types -------------------------------------------------------------

type ImageMime = "image/png" | "image/jpeg";

type ImageItem = {
  id: string;
  kind: "signature" | "stamp";
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  dataUrl: string;
  mime: ImageMime;
};

type DateItem = {
  id: string;
  kind: "date";
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
};

type SignItem = ImageItem | DateItem;

type CachedImage = {
  dataUrl: string;
  mime: ImageMime;
  aspectRatio: number;
};

type PlaceMode =
  | { kind: "signature" | "stamp"; image: CachedImage }
  | { kind: "date" };

const newId = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

const todayString = () => {
  const d = new Date();
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

async function readImageFile(file: File): Promise<CachedImage> {
  const isPng =
    file.type === "image/png" || file.name.toLowerCase().endsWith(".png");
  const isJpg =
    file.type === "image/jpeg" ||
    /\.(jpe?g)$/i.test(file.name);
  if (!isPng && !isJpg) {
    throw new Error("Please upload a PNG or JPEG image.");
  }
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read the image."));
    reader.readAsDataURL(file);
  });
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Could not load the image."));
    img.src = dataUrl;
  });
  return {
    dataUrl,
    mime: isPng ? "image/png" : "image/jpeg",
    aspectRatio: img.naturalWidth / img.naturalHeight || 1,
  };
}

// ----- Component ---------------------------------------------------------

export default function SignPdfTool() {
  // PDF state
  const [sourceBytes, setSourceBytes] = useState<Uint8Array | null>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [fileName, setFileName] = useState("");
  const [hasOpened, setHasOpened] = useState(false);

  // Items placed on pages
  const [items, setItems] = useState<SignItem[]>([]);
  const [history, setHistory] = useState<SignItem[][]>([]);

  // Cached uploads (so user doesn't re-upload for each placement)
  const [signatureImg, setSignatureImg] = useState<CachedImage | null>(null);
  const [stampImg, setStampImg] = useState<CachedImage | null>(null);

  // Interaction state
  const [placeMode, setPlaceMode] = useState<PlaceMode | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingDateId, setEditingDateId] = useState<string | null>(null);
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);

  // Saved PDF
  const [savedBytes, setSavedBytes] = useState<Uint8Array | null>(null);
  const [savedFileName, setSavedFileName] = useState("");
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const stampInputRef = useRef<HTMLInputElement>(null);

  // Any change to items invalidates the previously-saved PDF.
  useEffect(() => {
    setSavedBytes(null);
  }, [items]);

  const pushHistory = useCallback(() => {
    setHistory((prev) => [...prev.slice(-49), items]);
  }, [items]);

  const undo = () => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setItems(last);
      return prev.slice(0, -1);
    });
    setSelectedId(null);
    setEditingDateId(null);
  };

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
      setItems([]);
      setHistory([]);
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

  // --- Add tools ---

  const openSignatureModal = () => {
    setError(null);
    setSignatureModalOpen(true);
  };

  const onSignatureChosen = (img: SignatureImage) => {
    const cached: CachedImage = {
      dataUrl: img.dataUrl,
      mime: img.mime,
      aspectRatio: img.aspectRatio,
    };
    setSignatureImg(cached);
    setPlaceMode({ kind: "signature", image: cached });
    setSelectedId(null);
    setSignatureModalOpen(false);
  };

  const triggerStampUpload = () => {
    setError(null);
    stampInputRef.current?.click();
  };
  const onStampFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    try {
      const img = await readImageFile(f);
      setStampImg(img);
      setPlaceMode({ kind: "stamp", image: img });
      setSelectedId(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const reusePlaced = (kind: "signature" | "stamp") => {
    const img = kind === "signature" ? signatureImg : stampImg;
    if (img) {
      setPlaceMode({ kind, image: img });
      setSelectedId(null);
    } else if (kind === "signature") openSignatureModal();
    else triggerStampUpload();
  };

  const startPlaceDate = () => {
    setError(null);
    setPlaceMode({ kind: "date" });
    setSelectedId(null);
  };

  // --- Place an item by clicking on a page ---

  const handlePageClick = (
    pageIndex: number,
    localX: number,
    localY: number
  ) => {
    if (!placeMode) return;
    pushHistory();
    if (placeMode.kind === "date") {
      const fontSize = 18;
      const text = todayString();
      const item: DateItem = {
        id: newId(),
        kind: "date",
        pageIndex,
        x: localX,
        y: localY,
        width: Math.max(120, text.length * fontSize * 0.55),
        height: fontSize * 1.4,
        text,
        fontSize,
      };
      setItems((prev) => [...prev, item]);
      setSelectedId(item.id);
    } else {
      const img = placeMode.image;
      // Default placement size: 200 px wide for signatures, 140 for stamps.
      const defaultWidth = placeMode.kind === "signature" ? 200 : 140;
      const item: ImageItem = {
        id: newId(),
        kind: placeMode.kind,
        pageIndex,
        x: localX,
        y: localY,
        width: defaultWidth,
        height: defaultWidth / img.aspectRatio,
        dataUrl: img.dataUrl,
        mime: img.mime,
      };
      setItems((prev) => [...prev, item]);
      setSelectedId(item.id);
    }
    setPlaceMode(null); // place once, clear cursor
  };

  const updateItem = (id: string, patch: Partial<SignItem>) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? ({ ...i, ...patch } as SignItem) : i))
    );
  };

  const deleteItem = (id: string) => {
    pushHistory();
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (selectedId === id) setSelectedId(null);
    if (editingDateId === id) setEditingDateId(null);
  };

  const reset = () => {
    if (hasOpened && !confirm("Discard the current PDF and start over?"))
      return;
    setSourceBytes(null);
    setPdf(null);
    setPageCount(0);
    setItems([]);
    setHistory([]);
    setSignatureImg(null);
    setStampImg(null);
    setSelectedId(null);
    setPlaceMode(null);
    setEditingDateId(null);
    setSavedBytes(null);
    setFileName("");
    setHasOpened(false);
    setError(null);
  };

  // --- Esc clears selection / place mode ---
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (editingDateId) setEditingDateId(null);
        else if (placeMode) setPlaceMode(null);
        else if (selectedId) setSelectedId(null);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [editingDateId, placeMode, selectedId]);

  // --- Save / Download / Share / Email ---

  const saveChanges = async () => {
    if (!sourceBytes) return;
    setExporting(true);
    setError(null);
    try {
      const pdfDoc = await PDFDocument.load(sourceBytes);
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();

      // Pre-embed images to avoid re-embedding for duplicate placements.
      const imageCache = new Map<
        string,
        Awaited<ReturnType<PDFDocument["embedPng"]>>
      >();
      const getEmbeddedImage = async (item: ImageItem) => {
        if (imageCache.has(item.dataUrl)) return imageCache.get(item.dataUrl)!;
        const bytes = await fetch(item.dataUrl).then((r) => r.arrayBuffer());
        const img =
          item.mime === "image/png"
            ? await pdfDoc.embedPng(bytes)
            : await pdfDoc.embedJpg(bytes);
        imageCache.set(item.dataUrl, img);
        return img;
      };

      for (const item of items) {
        const page = pages[item.pageIndex];
        if (!page) continue;
        const { height: pageHeightPt } = page.getSize();

        // Editor stores coords in CSS-pixels at SCALE; convert to PDF points.
        const xPt = item.x / SCALE;
        const yTopPt = item.y / SCALE;
        const wPt = item.width / SCALE;
        const hPt = item.height / SCALE;
        // PDF coordinate system: bottom-left origin.
        const yBottomPt = pageHeightPt - yTopPt - hPt;

        if (item.kind === "date") {
          // Account for baseline.
          const sizePt = item.fontSize / SCALE;
          page.drawText(item.text, {
            x: xPt,
            y: pageHeightPt - yTopPt / 1 - sizePt * 0.85,
            size: sizePt,
            font: helvetica,
            color: rgb(0, 0, 0),
          });
        } else {
          const img = await getEmbeddedImage(item);
          page.drawImage(img, {
            x: xPt,
            y: yBottomPt,
            width: wPt,
            height: hPt,
          });
        }
      }

      const out = await pdfDoc.save();
      const base = fileName.replace(/\.pdf$/i, "") || "signed";
      setSavedBytes(out);
      setSavedFileName(`${base}-signed.pdf`);
    } catch (err) {
      console.error(err);
      setError("Could not save changes. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const buildSavedFile = (): File | null => {
    if (!savedBytes) return null;
    const blob = new Blob([new Uint8Array(savedBytes)], {
      type: "application/pdf",
    });
    return new File([blob], savedFileName || "signed.pdf", {
      type: "application/pdf",
    });
  };

  const downloadSavedFile = () => {
    const f = buildSavedFile();
    if (!f) return;
    const url = URL.createObjectURL(f);
    const a = document.createElement("a");
    a.href = url;
    a.download = f.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareSavedFile = async () => {
    const f = buildSavedFile();
    if (!f) return;
    const nav = navigator as Navigator & {
      canShare?: (data: ShareData) => boolean;
    };
    if (
      typeof nav.share === "function" &&
      typeof nav.canShare === "function" &&
      nav.canShare({ files: [f] })
    ) {
      try {
        await nav.share({ files: [f], title: f.name, text: "Signed with GetPDFTool" });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError("Could not open the share menu.");
        }
      }
    } else {
      setError(
        "Sharing isn't supported in this browser. Please download the file and share it manually."
      );
    }
  };

  const emailSavedFile = () => {
    if (!savedBytes) return;
    downloadSavedFile();
    const subject = encodeURIComponent(
      `Signed PDF — ${savedFileName || "signed.pdf"}`
    );
    const body = encodeURIComponent(
      `Hi,\n\nPlease find the signed PDF attached.\n\nNote: the file has just been downloaded to your computer. Please attach it from your Downloads folder before sending.\n\nSigned with GetPDFTool — https://www.getpdftool.com`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
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
            ✍️
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Drop a PDF to sign it
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
      {/* hidden input for stamp picks */}
      <input
        ref={stampInputRef}
        type="file"
        accept="image/png,image/jpeg,.png,.jpg,.jpeg"
        className="hidden"
        onChange={onStampFileInput}
      />

      <SignatureSourceModal
        open={signatureModalOpen}
        onClose={() => setSignatureModalOpen(false)}
        onSubmit={onSignatureChosen}
      />

      {/* Toolbar */}
      <div className="sticky top-16 z-30 mb-4 rounded-2xl border border-gray-100 bg-white/95 p-3 shadow-soft backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-gray-700">
            📄 {fileName} —{" "}
            <span className="text-gray-500">
              {pageCount} page{pageCount === 1 ? "" : "s"} ·{" "}
              {items.length} item{items.length === 1 ? "" : "s"} placed
            </span>
          </p>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => reusePlaced("signature")}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                placeMode?.kind === "signature"
                  ? "border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-200"
                  : "border-gray-200 bg-white text-gray-700 hover:border-brand-300"
              }`}
              title={
                signatureImg
                  ? "Place your signature again"
                  : "Draw, type or upload a signature, then place it"
              }
            >
              ✍️ {signatureImg ? "Place signature" : "Add signature"}
            </button>
            {signatureImg && (
              <button
                type="button"
                onClick={openSignatureModal}
                className="rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs text-gray-600 hover:border-brand-300"
                title="Change signature (draw / type / upload)"
              >
                ↻
              </button>
            )}

            <button
              type="button"
              onClick={startPlaceDate}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                placeMode?.kind === "date"
                  ? "border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-200"
                  : "border-gray-200 bg-white text-gray-700 hover:border-brand-300"
              }`}
              title="Place today's date as text — you can edit it after placing"
            >
              📅 Add date
            </button>

            <button
              type="button"
              onClick={() => reusePlaced("stamp")}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                placeMode?.kind === "stamp"
                  ? "border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-200"
                  : "border-gray-200 bg-white text-gray-700 hover:border-brand-300"
              }`}
              title={
                stampImg
                  ? "Place your uploaded stamp again"
                  : "Upload a company stamp image and place it"
              }
            >
              🔖 {stampImg ? "Place stamp" : "Add company stamp"}
            </button>
            {stampImg && (
              <button
                type="button"
                onClick={triggerStampUpload}
                className="rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs text-gray-600 hover:border-brand-300"
                title="Upload a different stamp"
              >
                ↻
              </button>
            )}

            <div className="mx-1 h-8 w-px bg-gray-200" />

            <button
              type="button"
              onClick={undo}
              disabled={history.length === 0}
              className="btn-ghost"
              title="Undo last change"
            >
              ↶ Undo
            </button>
            <button type="button" onClick={reset} className="btn-ghost">
              ✕ New PDF
            </button>
            <button
              type="button"
              onClick={saveChanges}
              disabled={exporting || items.length === 0 || !!savedBytes}
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
                >
                  ↓ Download
                </button>
                <button
                  type="button"
                  onClick={shareSavedFile}
                  className="flex items-center gap-1.5 border-l border-emerald-500 px-3 py-3 text-sm font-semibold transition hover:bg-emerald-700"
                >
                  📤 Share
                </button>
                <button
                  type="button"
                  onClick={emailSavedFile}
                  className="flex items-center gap-1.5 border-l border-emerald-500 px-3 py-3 text-sm font-semibold transition hover:bg-emerald-700"
                >
                  ✉ Email
                </button>
              </div>
            )}
          </div>
        </div>
        <p className="mt-2 text-xs text-brand-700">
          {placeMode
            ? placeMode.kind === "date"
              ? "Click on a page to drop today's date. Drag to move or double-click to edit."
              : `Click on a page to place your ${placeMode.kind}. Drag corners to resize after.`
            : "Use the buttons above to add a signature, date or company stamp. Drag any placed item to move it."}
        </p>
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
            <SignPageView
              key={i}
              pdf={pdf}
              pageIndex={i}
              scale={SCALE}
              items={items.filter((it) => it.pageIndex === i)}
              placeMode={placeMode}
              selectedId={selectedId}
              editingDateId={editingDateId}
              onPlace={(x, y) => handlePageClick(i, x, y)}
              onSelect={(id) => setSelectedId(id)}
              onUpdateItem={updateItem}
              onDeleteItem={deleteItem}
              onPushHistory={pushHistory}
              onStartEditDate={(id) => setEditingDateId(id)}
              onStopEditDate={() => setEditingDateId(null)}
            />
          ))}
      </div>
    </div>
  );
}

// ----- Single-page view + interactive items ------------------------------

type SignPageViewProps = {
  pdf: PDFDocumentProxy;
  pageIndex: number;
  scale: number;
  items: SignItem[];
  placeMode: PlaceMode | null;
  selectedId: string | null;
  editingDateId: string | null;
  onPlace: (x: number, y: number) => void;
  onSelect: (id: string | null) => void;
  onUpdateItem: (id: string, patch: Partial<SignItem>) => void;
  onDeleteItem: (id: string) => void;
  onPushHistory: () => void;
  onStartEditDate: (id: string) => void;
  onStopEditDate: () => void;
};

function SignPageView({
  pdf,
  pageIndex,
  scale,
  items,
  placeMode,
  selectedId,
  editingDateId,
  onPlace,
  onSelect,
  onUpdateItem,
  onDeleteItem,
  onPushHistory,
  onStartEditDate,
  onStopEditDate,
}: SignPageViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    let task: { promise: Promise<void>; cancel: () => void } | null = null;
    (async () => {
      const page = await pdf.getPage(pageIndex + 1);
      const viewport = page.getViewport({ scale });
      if (cancelled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      setSize({ w: viewport.width, h: viewport.height });
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
  }, [pdf, pageIndex, scale]);

  const localPoint = (e: React.MouseEvent | MouseEvent) => {
    const r = overlayRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onOverlayClick = (e: React.MouseEvent) => {
    if (!placeMode) {
      onSelect(null);
      return;
    }
    const p = localPoint(e);
    onPlace(p.x, p.y);
  };

  const startMove = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onPushHistory();
    const start = localPoint(e);
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const origX = item.x;
    const origY = item.y;
    const onMove = (ev: MouseEvent) => {
      const p = localPoint(ev);
      onUpdateItem(id, {
        x: origX + (p.x - start.x),
        y: origY + (p.y - start.y),
      });
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const startResize = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onPushHistory();
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const start = localPoint(e);
    const origW = item.width;
    const origH = item.height;
    const aspect = origH > 0 ? origW / origH : 1;
    const isImage = item.kind !== "date";
    const onMove = (ev: MouseEvent) => {
      const p = localPoint(ev);
      const dx = p.x - start.x;
      const newW = Math.max(20, origW + dx);
      const newH = isImage ? newW / aspect : Math.max(10, origH + (p.y - start.y));
      onUpdateItem(id, { width: newW, height: newH });
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const cursor = placeMode ? "crosshair" : "default";

  return (
    <div className="relative inline-block">
      <div className="mb-2 text-xs text-gray-500">Page {pageIndex + 1}</div>
      <div className="pdf-page-wrapper">
        <canvas ref={canvasRef} />
        {size && (
          <div
            ref={overlayRef}
            className="pdf-overlay"
            style={{ width: size.w, height: size.h, cursor }}
            onClick={onOverlayClick}
          >
            {items.map((item) => (
              <SignItemView
                key={item.id}
                item={item}
                isSelected={selectedId === item.id}
                isEditingDate={editingDateId === item.id}
                onSelect={() => onSelect(item.id)}
                onStartMove={(e) => startMove(item.id, e)}
                onStartResize={(e) => startResize(item.id, e)}
                onDelete={() => onDeleteItem(item.id)}
                onUpdateText={(text) => onUpdateItem(item.id, { text })}
                onStartEditDate={() => onStartEditDate(item.id)}
                onStopEditDate={onStopEditDate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ----- Individual placed item ------------------------------------------

type SignItemViewProps = {
  item: SignItem;
  isSelected: boolean;
  isEditingDate: boolean;
  onSelect: () => void;
  onStartMove: (e: React.MouseEvent) => void;
  onStartResize: (e: React.MouseEvent) => void;
  onDelete: () => void;
  onUpdateText: (text: string) => void;
  onStartEditDate: () => void;
  onStopEditDate: () => void;
};

function SignItemView({
  item,
  isSelected,
  isEditingDate,
  onSelect,
  onStartMove,
  onStartResize,
  onDelete,
  onUpdateText,
  onStartEditDate,
  onStopEditDate,
}: SignItemViewProps) {
  const dateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditingDate && dateRef.current) {
      const el = dateRef.current;
      el.focus();
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }, [isEditingDate]);

  const wrapperStyle: React.CSSProperties = {
    position: "absolute",
    left: item.x,
    top: item.y,
    width: item.width,
    height: item.kind === "date" ? "auto" : item.height,
    pointerEvents: "auto",
  };

  return (
    <div
      style={wrapperStyle}
      className={`group ${isSelected ? "ring-2 ring-brand-500 ring-offset-1" : "ring-1 ring-transparent hover:ring-brand-300"}`}
      onMouseDown={(e) => {
        // Start move unless clicking the resize handle / delete / editing
        if (isEditingDate) return;
        onSelect();
        onStartMove(e);
      }}
    >
      {item.kind === "date" ? (
        <div
          ref={dateRef}
          contentEditable={isEditingDate}
          suppressContentEditableWarning
          onDoubleClick={(e) => {
            e.stopPropagation();
            onSelect();
            onStartEditDate();
          }}
          onBlur={(e) => {
            onUpdateText((e.target as HTMLDivElement).innerText);
            onStopEditDate();
          }}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              (e.target as HTMLDivElement).blur();
            } else if (e.key === "Escape") {
              (e.target as HTMLDivElement).blur();
            }
          }}
          onMouseDown={(e) => {
            // Stop propagation when actively editing so caret can be placed.
            if (isEditingDate) e.stopPropagation();
          }}
          className="select-none px-1 font-sans text-black outline-none"
          style={{
            fontSize: item.fontSize,
            cursor: isEditingDate ? "text" : "move",
          }}
        >
          {item.text}
        </div>
      ) : (
        <img
          src={item.dataUrl}
          alt={item.kind === "signature" ? "Signature" : "Stamp"}
          draggable={false}
          className="block h-full w-full select-none"
          style={{ pointerEvents: "none" }}
        />
      )}

      {/* Action buttons on hover/select */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        title="Remove"
        className={`absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-white text-xs font-bold text-red-600 shadow ring-1 ring-red-200 ${isSelected ? "" : "opacity-0 group-hover:opacity-100"}`}
      >
        ✕
      </button>

      {/* Resize handle (bottom-right) */}
      {isSelected && item.kind !== "date" && (
        <div
          onMouseDown={onStartResize}
          title="Drag to resize"
          className="absolute -right-1 -bottom-1 h-3 w-3 cursor-nwse-resize rounded-sm border border-brand-700 bg-brand-500"
        />
      )}
    </div>
  );
}
