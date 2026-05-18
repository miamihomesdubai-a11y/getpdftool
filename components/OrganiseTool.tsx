"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { PDFDocument, degrees } from "pdf-lib";
import { pdfjsLib } from "@/lib/pdfWorker";
import { downloadFile, printFile, shareFile } from "@/lib/fileActions";

type Rotation = 0 | 90 | 180 | 270;

type PdfPage = {
  id: string;
  kind: "pdf";
  sourceId: string;
  sourceIndex: number;
  rotation: Rotation;
};
type BlankPage = {
  id: string;
  kind: "blank";
  width: number;
  height: number;
  rotation: Rotation;
};
type PageItem = PdfPage | BlankPage;

type PageSource = {
  pdf: PDFDocumentProxy;
  bytes: Uint8Array;
  fileName: string;
};

const THUMB_SCALE = 0.5;
const PREVIEW_SCALE = 1.6;

const newId = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export default function OrganiseTool() {
  const [sources, setSources] = useState<Map<string, PageSource>>(new Map());
  const [pages, setPages] = useState<PageItem[]>([]);
  const [history, setHistory] = useState<PageItem[][]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewId, setPreviewId] = useState<string | null>(null);

  const [primaryFileName, setPrimaryFileName] = useState("");
  const [hasOpened, setHasOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [savedBytes, setSavedBytes] = useState<Uint8Array | null>(null);
  const [savedFileName, setSavedFileName] = useState("");

  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const initialFileRef = useRef<HTMLInputElement>(null);
  const addFileRef = useRef<HTMLInputElement>(null);
  const lastClickedIndexRef = useRef<number | null>(null);

  // Reset saved bytes whenever the page list changes.
  useEffect(() => {
    setSavedBytes(null);
  }, [pages]);

  const pushHistory = useCallback(() => {
    setHistory((prev) => [...prev.slice(-49), pages]);
  }, [pages]);

  const undo = () => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setPages(last);
      return prev.slice(0, -1);
    });
  };

  // ---- File loading -----------------------------------------------------

  /** Load a PDF and produce a list of PageItems referencing a fresh source id. */
  const loadPdfIntoSource = async (
    file: File
  ): Promise<{
    sourceId: string;
    source: PageSource;
    items: PageItem[];
  }> => {
    const buf = await file.arrayBuffer();
    const sourceCopy = new Uint8Array(buf.slice(0));
    const pdfjsCopy = new Uint8Array(buf.slice(0));
    const doc = await pdfjsLib.getDocument({ data: pdfjsCopy }).promise;
    const sourceId = newId();
    const items: PageItem[] = [];
    for (let i = 0; i < doc.numPages; i++) {
      const p = await doc.getPage(i + 1);
      items.push({
        id: newId(),
        kind: "pdf",
        sourceId,
        sourceIndex: i,
        rotation: ((p.rotate ?? 0) % 360) as Rotation,
      });
    }
    return {
      sourceId,
      source: { pdf: doc, bytes: sourceCopy, fileName: file.name },
      items,
    };
  };

  /** First file loaded — replaces everything. */
  const loadInitialFile = useCallback(async (file: File) => {
    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Please choose a PDF file.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { sourceId, source, items } = await loadPdfIntoSource(file);
      setSources(new Map([[sourceId, source]]));
      setPages(items);
      setHistory([]);
      setSelectedIds(new Set());
      setSavedBytes(null);
      setPrimaryFileName(file.name);
      setHasOpened(true);
    } catch (err) {
      console.error(err);
      setError("Could not open that PDF. It may be password-protected or damaged.");
    } finally {
      setLoading(false);
    }
  }, []);

  /** Append all pages from another PDF after the current last page. */
  const addPagesFromFile = useCallback(async (file: File) => {
    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Please choose a PDF file.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { sourceId, source, items } = await loadPdfIntoSource(file);
      pushHistory();
      setSources((prev) => {
        const next = new Map(prev);
        next.set(sourceId, source);
        return next;
      });
      setPages((prev) => [...prev, ...items]);
    } catch (err) {
      console.error(err);
      setError("Could not load that PDF. It may be password-protected or damaged.");
    } finally {
      setLoading(false);
    }
  }, [pushHistory]);

  /** Append a blank A4 page after the current last page. */
  const addBlankPage = () => {
    pushHistory();
    setPages((prev) => [
      ...prev,
      {
        id: newId(),
        kind: "blank",
        width: 595,
        height: 842,
        rotation: 0,
      },
    ]);
  };

  const onInitialFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) loadInitialFile(f);
    e.target.value = "";
  };

  const onAddFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) addPagesFromFile(f);
    e.target.value = "";
  };

  const onDropInitial = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) loadInitialFile(f);
  };

  // ---- Page operations --------------------------------------------------

  const movePage = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0) return;
    pushHistory();
    setPages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      const insertAt = from < to ? to - 1 : to;
      next.splice(insertAt, 0, moved);
      return next;
    });
  };

  const rotatePage = (i: number, dir: 1 | -1) => {
    pushHistory();
    setPages((prev) =>
      prev.map((p, idx) =>
        idx === i
          ? {
              ...p,
              rotation: (((p.rotation + dir * 90 + 360) % 360) as Rotation),
            }
          : p
      )
    );
  };

  const deletePages = (ids: Set<string>) => {
    if (ids.size === 0) return;
    pushHistory();
    setPages((prev) => prev.filter((p) => !ids.has(p.id)));
    setSelectedIds(new Set());
  };

  const copySelected = () => {
    if (selectedIds.size === 0) return;
    pushHistory();
    const newSelectedIds = new Set<string>();
    setPages((prev) => {
      const result: PageItem[] = [];
      for (const p of prev) {
        result.push(p);
        if (selectedIds.has(p.id)) {
          const copy: PageItem = { ...p, id: newId() } as PageItem;
          result.push(copy);
          newSelectedIds.add(copy.id);
        }
      }
      return result;
    });
    // Move selection to the new copies so the user can act on them next.
    setSelectedIds(newSelectedIds);
  };

  const reset = () => {
    if (hasOpened && !confirm("Discard the current PDF and start over?"))
      return;
    setSources(new Map());
    setPages([]);
    setHistory([]);
    setSelectedIds(new Set());
    setPrimaryFileName("");
    setHasOpened(false);
    setSavedBytes(null);
  };

  // ---- Selection --------------------------------------------------------

  /** Click handling for selection: plain / ctrl-cmd / shift. */
  const handlePageClick = (
    index: number,
    e: React.MouseEvent | React.KeyboardEvent
  ) => {
    const id = pages[index].id;
    const meta = (e as React.MouseEvent).metaKey || (e as React.MouseEvent).ctrlKey;
    const shift = (e as React.MouseEvent).shiftKey;

    if (shift && lastClickedIndexRef.current != null) {
      const a = Math.min(lastClickedIndexRef.current, index);
      const b = Math.max(lastClickedIndexRef.current, index);
      const range = pages.slice(a, b + 1).map((p) => p.id);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const rid of range) next.add(rid);
        return next;
      });
    } else if (meta) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
      lastClickedIndexRef.current = index;
    } else {
      // Plain click: select just this one (or unselect if it's the only one).
      setSelectedIds((prev) => {
        if (prev.size === 1 && prev.has(id)) return new Set();
        return new Set([id]);
      });
      lastClickedIndexRef.current = index;
    }
  };

  // Esc clears selection / closes preview.
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (previewId) setPreviewId(null);
        else if (selectedIds.size > 0) setSelectedIds(new Set());
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [previewId, selectedIds]);

  // ---- Save / Download / Share / Email ----------------------------------

  /**
   * Save Changes → builds the merged PDF and triggers an immediate
   * browser download. The "saved" state then unlocks the Print and
   * Share buttons for follow-up actions. Auto-downloading on save
   * removes the "what do I click next?" confusion that made the
   * flow feel tricky when many pages were assembled.
   */
  /**
   * Save Changes → builds the merged PDF and triggers an immediate
   * browser download. The "saved" state then unlocks the Print and
   * Share buttons for follow-up actions. Auto-downloading on save
   * removes the "what do I click next?" confusion that made the
   * flow feel tricky when many pages were assembled.
   */
  const saveChanges = async () => {
    if (pages.length === 0) return;
    setExporting(true);
    setError(null);
    let lastErr: unknown = null;
    try {
      const newPdf = await PDFDocument.create();

      // Pre-load each source PDF once with pdf-lib.
      // ignoreEncryption lets us copy pages out of PDFs that have a
      // viewer password set (very common with bank statements, form
      // exports, contracts). Without this flag those silently fail
      // here and the user sees a generic "Could not save" error.
      const sourceDocs = new Map<string, PDFDocument>();
      for (const [id, src] of sources.entries()) {
        try {
          sourceDocs.set(
            id,
            await PDFDocument.load(src.bytes, {
              ignoreEncryption: true,
              updateMetadata: false,
            })
          );
        } catch (loadErr) {
          // One bad source shouldn't kill the whole save — just skip
          // its pages and keep going. We surface a helpful warning at
          // the end so the user knows what was dropped.
          console.error(
            `Could not load source PDF "${src.fileName}":`,
            loadErr
          );
          lastErr = new Error(
            `"${src.fileName}" couldn't be opened (it may be password-protected or damaged).`
          );
        }
      }

      let copyFailures = 0;
      for (const item of pages) {
        if (item.kind === "blank") {
          newPdf.addPage([item.width, item.height]).setRotation(
            degrees(item.rotation)
          );
          continue;
        }
        const src = sourceDocs.get(item.sourceId);
        if (!src) {
          copyFailures++;
          continue;
        }
        try {
          const [copied] = await newPdf.copyPages(src, [item.sourceIndex]);
          copied.setRotation(degrees(item.rotation));
          newPdf.addPage(copied);
        } catch (copyErr) {
          console.error(
            `Could not copy page ${item.sourceIndex + 1} of source ${item.sourceId}:`,
            copyErr
          );
          copyFailures++;
        }
      }

      if (newPdf.getPageCount() === 0) {
        throw new Error(
          "None of the selected pages could be copied. The source PDF may be heavily encrypted or corrupted."
        );
      }

      const out = await newPdf.save({ useObjectStreams: true });
      const base = primaryFileName.replace(/\.pdf$/i, "") || "organised";
      const fileName = `${base}-organised.pdf`;
      setSavedBytes(out);
      setSavedFileName(fileName);
      downloadFile(out, fileName);

      if (copyFailures > 0) {
        setError(
          `Saved with ${copyFailures} page${copyFailures === 1 ? "" : "s"} skipped — see browser console for details.`
        );
      } else if (lastErr) {
        setError((lastErr as Error).message);
      }
    } catch (err) {
      console.error("Save failed:", err);
      const msg = (err as Error).message;
      setError(
        msg && msg.length < 200
          ? `Could not save: ${msg}`
          : "Could not save changes. The source PDF may be encrypted or damaged — try opening it in a different viewer first."
      );
    } finally {
      setExporting(false);
    }
  };

  const downloadSavedFile = () => {
    if (!savedBytes) return;
    downloadFile(savedBytes, savedFileName || "organised.pdf");
  };

  const printSavedFile = () => {
    if (!savedBytes) return;
    const err = printFile(savedBytes, savedFileName || "organised.pdf");
    if (err) setError(err);
  };

  const shareSavedFile = async () => {
    if (!savedBytes) return;
    const err = await shareFile(
      savedBytes,
      savedFileName || "organised.pdf",
      "Organised with GetPDFTool"
    );
    if (err) setError(err);
  };

  // ---- Add Page menu state ---------------------------------------------

  const [addOpen, setAddOpen] = useState(false);
  const addRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!addOpen) return;
    const h = (e: MouseEvent) => {
      if (addRef.current && !addRef.current.contains(e.target as Node)) {
        setAddOpen(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [addOpen]);

  const previewItem = useMemo(
    () => pages.find((p) => p.id === previewId) ?? null,
    [pages, previewId]
  );

  // ---- Render -----------------------------------------------------------

  if (!hasOpened) {
    return (
      <div className="container-narrow py-10">
        <div
          onDrop={onDropInitial}
          onDragOver={(e) => e.preventDefault()}
          className="rounded-3xl border-2 border-dashed border-brand-200 bg-white/60 p-10 text-center shadow-soft transition hover:border-brand-400 hover:bg-brand-50/60"
        >
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-soft">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-8 w-8"
              aria-hidden="true"
            >
              <path d="M3 5a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v2H3V5Zm0 5h18v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9Z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Drop a PDF to organise its pages
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or pick one from your computer. All work happens in your browser
            — your file is never uploaded.
          </p>
          <div className="mt-6">
            <input
              ref={initialFileRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={onInitialFileInput}
            />
            <button
              type="button"
              onClick={() => initialFileRef.current?.click()}
              className="btn-primary"
              disabled={loading}
            >
              {loading ? "Opening…" : "Choose PDF file"}
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
      {/* Toolbar */}
      <div className="sticky top-16 z-30 mb-4 rounded-2xl border border-gray-100 bg-white/95 p-3 shadow-soft backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-gray-700">
            📄 {primaryFileName || "Untitled"} —{" "}
            <span className="text-gray-500">
              {pages.length} page{pages.length === 1 ? "" : "s"}
              {selectedIds.size > 0 && (
                <>
                  {" "}
                  · <span className="text-brand-700">
                    {selectedIds.size} selected
                  </span>
                </>
              )}
            </span>
          </p>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            {/* + Add Page dropdown */}
            <div ref={addRef} className="relative">
              <button
                type="button"
                onClick={() => setAddOpen((v) => !v)}
                className="inline-flex items-center gap-1 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700 hover:border-brand-400 hover:bg-brand-100"
              >
                ＋ Add Page ▾
              </button>
              {addOpen && (
                <div className="absolute right-0 z-40 mt-1 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setAddOpen(false);
                      addBlankPage();
                    }}
                    className="flex w-full items-start gap-2 px-3 py-2 text-left text-xs hover:bg-brand-50"
                  >
                    <span className="text-base leading-none">📄</span>
                    <span>
                      <span className="block font-medium text-gray-900">
                        Blank page
                      </span>
                      <span className="block text-[11px] text-gray-500">
                        Append an empty A4 page
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addFileRef.current?.click()}
                    className="flex w-full items-start gap-2 border-t border-gray-100 px-3 py-2 text-left text-xs hover:bg-brand-50"
                  >
                    <span className="text-base leading-none">📁</span>
                    <span>
                      <span className="block font-medium text-gray-900">
                        Pages from PDF…
                      </span>
                      <span className="block text-[11px] text-gray-500">
                        Append all pages from another PDF
                      </span>
                    </span>
                  </button>
                  <input
                    ref={addFileRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      setAddOpen(false);
                      onAddFileInput(e);
                    }}
                  />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={copySelected}
              disabled={selectedIds.size === 0}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:border-brand-300 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
              title="Copy selected pages"
            >
              ⎘ Copy ({selectedIds.size})
            </button>
            <button
              type="button"
              onClick={() => deletePages(selectedIds)}
              disabled={selectedIds.size === 0}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:border-red-300 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
              title="Delete selected pages"
            >
              🗑 Delete ({selectedIds.size})
            </button>

            <button
              type="button"
              onClick={undo}
              className="btn-ghost"
              disabled={history.length === 0}
              title="Undo"
            >
              ↶ Undo
            </button>
            <button type="button" onClick={reset} className="btn-ghost">
              ✕ New PDF
            </button>
            <button
              type="button"
              onClick={saveChanges}
              disabled={exporting || pages.length === 0}
              className="btn-primary"
              title={
                savedBytes
                  ? "Save and download again"
                  : "Build your PDF and download it"
              }
            >
              {exporting
                ? "Saving…"
                : savedBytes
                  ? "↻ Save & Download again"
                  : "💾 Save & Download"}
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
        <p className="mt-2 text-xs text-brand-700">
          Tip: click a page to select. Hold ⌘/Ctrl to add/remove from
          selection, or Shift to pick a range. Drag a page to reorder.
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

      {pages.length === 0 ? (
        <div className="rounded-xl bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          All pages were deleted.{" "}
          <button onClick={undo} className="font-semibold underline">
            Undo
          </button>{" "}
          or use <strong>+ Add Page</strong> to insert a new one.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {pages.map((p, i) => (
            <PageCard
              key={p.id}
              page={p}
              displayIndex={i}
              source={
                p.kind === "pdf" ? sources.get(p.sourceId)?.pdf ?? null : null
              }
              isSelected={selectedIds.has(p.id)}
              isDragging={draggingIndex === i}
              isDropTarget={dragOverIndex === i && draggingIndex !== i}
              onSelect={(e) => handlePageClick(i, e)}
              onPreview={() => setPreviewId(p.id)}
              onRotateCw={() => rotatePage(i, 1)}
              onRotateCcw={() => rotatePage(i, -1)}
              onDragStart={() => setDraggingIndex(i)}
              onDragEnd={() => {
                setDraggingIndex(null);
                setDragOverIndex(null);
              }}
              onDragOver={() => setDragOverIndex(i)}
              onDrop={() => {
                if (draggingIndex != null) movePage(draggingIndex, i);
                setDraggingIndex(null);
                setDragOverIndex(null);
              }}
            />
          ))}
        </div>
      )}

      {previewItem && (
        <PreviewModal
          item={previewItem}
          source={
            previewItem.kind === "pdf"
              ? sources.get(previewItem.sourceId)?.pdf ?? null
              : null
          }
          displayIndex={pages.findIndex((p) => p.id === previewItem.id)}
          totalPages={pages.length}
          onClose={() => setPreviewId(null)}
        />
      )}
    </div>
  );
}

// ---------------- PageCard --------------------------------------------------

type PageCardProps = {
  page: PageItem;
  source: PDFDocumentProxy | null;
  displayIndex: number;
  isSelected: boolean;
  isDragging: boolean;
  isDropTarget: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onPreview: () => void;
  onRotateCw: () => void;
  onRotateCcw: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: () => void;
  onDrop: () => void;
};

function PageCard({
  page,
  source,
  displayIndex,
  isSelected,
  isDragging,
  isDropTarget,
  onSelect,
  onPreview,
  onRotateCw,
  onRotateCcw,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: PageCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    if (page.kind !== "pdf" || !source) {
      setRendered(true);
      return;
    }
    let cancelled = false;
    let task: { promise: Promise<void>; cancel: () => void } | null = null;
    (async () => {
      const p = await source.getPage(page.sourceIndex + 1);
      const viewport = p.getViewport({
        scale: THUMB_SCALE,
        rotation: page.rotation,
      });
      if (cancelled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      task = p.render({ canvasContext: ctx, viewport });
      try {
        await task.promise;
        if (!cancelled) setRendered(true);
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
  }, [
    source,
    page.kind,
    page.kind === "pdf" ? page.sourceIndex : -1,
    page.rotation,
  ]);

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", String(displayIndex));
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        onDragOver();
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
      onClick={onSelect}
      className={`group relative cursor-grab rounded-xl border bg-white p-2 shadow-sm transition active:cursor-grabbing ${
        isDragging
          ? "border-brand-400 opacity-40"
          : isSelected
            ? "border-brand-500 ring-2 ring-brand-300"
            : isDropTarget
              ? "border-brand-500 ring-2 ring-brand-300"
              : "border-gray-200 hover:border-brand-300 hover:shadow-md"
      }`}
    >
      {/* Top-left page number */}
      <div className="absolute left-2 top-2 z-10 rounded bg-gray-900/85 px-1.5 py-0.5 text-[10px] font-semibold text-white">
        {displayIndex + 1}
        {page.kind === "blank" && (
          <span className="ml-1 rounded bg-white/30 px-1 text-[9px]">BLANK</span>
        )}
      </div>

      {/* Selection check (top-right) */}
      {isSelected && (
        <div className="absolute right-2 top-2 z-10 grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-[11px] font-bold text-white shadow">
          ✓
        </div>
      )}

      {/* Centered hover icons: + preview, ↺ CCW, ↻ CW */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center gap-1 opacity-0 transition group-hover:opacity-100">
        <PageActionButton
          title="Enlarge (preview)"
          onClick={onPreview}
        >
          ＋
        </PageActionButton>
        <PageActionButton
          title="Rotate counter-clockwise"
          onClick={onRotateCcw}
        >
          ↺
        </PageActionButton>
        <PageActionButton
          title="Rotate clockwise"
          onClick={onRotateCw}
        >
          ↻
        </PageActionButton>
      </div>

      {/* Thumbnail */}
      <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded bg-gray-50">
        {page.kind === "pdf" ? (
          <canvas
            ref={canvasRef}
            className={`max-h-full max-w-full ${rendered ? "" : "opacity-0"}`}
          />
        ) : (
          <div
            className="grid h-full w-full place-items-center bg-white text-xs text-gray-400"
            style={{
              transform: `rotate(${page.rotation}deg)`,
            }}
          >
            blank
          </div>
        )}
        {!rendered && page.kind === "pdf" && (
          <span className="text-xs text-gray-400">Rendering…</span>
        )}
      </div>
    </div>
  );
}

function PageActionButton({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="pointer-events-auto grid h-9 w-9 place-items-center rounded-full bg-white/95 text-base font-semibold text-gray-800 shadow-md ring-1 ring-black/5 hover:bg-white hover:text-brand-700"
    >
      {children}
    </button>
  );
}

// ---------------- PreviewModal ---------------------------------------------

type PreviewModalProps = {
  item: PageItem;
  source: PDFDocumentProxy | null;
  displayIndex: number;
  totalPages: number;
  onClose: () => void;
};

function PreviewModal({
  item,
  source,
  displayIndex,
  totalPages,
  onClose,
}: PreviewModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    if (item.kind !== "pdf" || !source) {
      setRendered(true);
      return;
    }
    let cancelled = false;
    let task: { promise: Promise<void>; cancel: () => void } | null = null;
    (async () => {
      const p = await source.getPage(item.sourceIndex + 1);
      const viewport = p.getViewport({
        scale: PREVIEW_SCALE,
        rotation: item.rotation,
      });
      if (cancelled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      task = p.render({ canvasContext: ctx, viewport });
      try {
        await task.promise;
        if (!cancelled) setRendered(true);
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
  }, [
    source,
    item.kind,
    item.kind === "pdf" ? item.sourceIndex : -1,
    item.rotation,
  ]);

  // Esc OR Enter closes (per the user's request).
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="mb-3 flex w-full max-w-[1100px] items-center justify-between text-white">
        <div className="text-sm font-medium">
          Page {displayIndex + 1} of {totalPages}
          {item.kind === "blank" && " · BLANK"}
        </div>
        <div className="flex items-center gap-3 text-xs text-white/70">
          <kbd className="rounded border border-white/30 px-1.5 py-0.5">
            Enter
          </kbd>
          <span>or</span>
          <kbd className="rounded border border-white/30 px-1.5 py-0.5">
            Esc
          </kbd>
          <span>to close</span>
          <button
            type="button"
            onClick={onClose}
            className="ml-2 rounded-md border border-white/30 px-2 py-1 text-xs font-medium hover:bg-white/10"
          >
            ✕ Close
          </button>
        </div>
      </div>
      <div className="max-h-[85vh] max-w-[95vw] overflow-auto rounded-lg bg-white shadow-2xl">
        {item.kind === "pdf" ? (
          <canvas
            ref={canvasRef}
            className={`block ${rendered ? "" : "opacity-0"}`}
          />
        ) : (
          <div
            className="grid h-[85vh] w-[60vw] place-items-center bg-white text-sm text-gray-400"
            style={{ transform: `rotate(${item.rotation}deg)` }}
          >
            Blank page
          </div>
        )}
      </div>
    </div>
  );
}
