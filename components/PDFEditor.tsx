"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { pdfjsLib } from "@/lib/pdfWorker";
import {
  A4_PORTRAIT,
  FONT_LABELS,
  FONT_SIZES,
  TEXT_COLOR_PALETTE,
  type Annotation,
  type FontFamily,
  type PageMeta,
  type TextAnnotation,
  type ToolKind,
  type WhiteoutAnnotation,
} from "@/lib/types";
import { exportEditedPdf } from "@/lib/exportPdf";
import {
  detectPageType,
  extractPageText,
  findMatchesInPage,
  type SearchMatch,
  type TextItem,
} from "@/lib/pdfText";
import PageCanvas from "./PageCanvas";
import AddPageMenu, { type AddPosition } from "./AddPageMenu";
import FindReplaceModal from "./FindReplaceModal";
import { downloadFile, printFile, shareFile } from "@/lib/fileActions";

const SCALE = 1.5;

type PageSource = {
  pdf: PDFDocumentProxy;
  bytes: Uint8Array;
  fileName: string;
};

type Snapshot = {
  pages: PageMeta[];
  annotations: Annotation[];
};

const SHAPE_COLORS = [
  "#111827",
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#ffffff",
];

const newId = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export default function PDFEditor() {
  // ---- Document state -----------------------------------------------------
  const [sources, setSources] = useState<Map<string, PageSource>>(new Map());
  const [pages, setPages] = useState<PageMeta[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [history, setHistory] = useState<Snapshot[]>([]);
  // Redo stack — separate from history. Cleared whenever the user makes
  // a fresh edit (any new pushHistory).
  const [redoStack, setRedoStack] = useState<Snapshot[]>([]);
  // Save → Preview overlay. When non-null, a full-screen preview of the
  // exported PDF is shown with Download / Print / Email / Share actions.
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // ---- Tool + style state -------------------------------------------------
  const [tool, setTool] = useState<ToolKind>("select");
  const [shapeColor, setShapeColor] = useState("#ef4444");
  const [shapeStrokeWidth, setShapeStrokeWidth] = useState(3);
  // X / Check marks default to black so they read like ink on paper,
  // with their own color picker so the user can switch to red/blue/etc.
  const [markColor, setMarkColor] = useState("#111827");
  const [markStrokeWidth, setMarkStrokeWidth] = useState(3);

  // Text style — used as defaults for new text AND mirrored from active text.
  const [textColor, setTextColor] = useState("#111827");
  const [textFontSize, setTextFontSize] = useState(20);
  const [textFontFamily, setTextFontFamily] = useState<FontFamily>("helvetica");
  const [textBold, setTextBold] = useState(false);
  const [textUnderline, setTextUnderline] = useState(false);

  // Active text (the one being edited, if any).
  const [activeTextId, setActiveTextId] = useState<string | null>(null);
  // Currently-selected annotation — drives the dashed bounding box and
  // resize handles on X / Check marks. null = nothing selected.
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<
    string | null
  >(null);

  // ---- View state --------------------------------------------------------
  const [zoom, setZoom] = useState(1.0);
  const zoomIn = () => setZoom((z) => Math.min(3.0, +(z + 0.1).toFixed(2)));
  const zoomOut = () => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2)));
  const zoomReset = () => setZoom(1.0);

  // ---- Status ------------------------------------------------------------
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [primaryFileName, setPrimaryFileName] = useState("");
  const [hasOpenedAnyPdf, setHasOpenedAnyPdf] = useState(false);
  const [justAddedIndex, setJustAddedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Two-step save flow: "Save Changes" generates the PDF bytes,
  // then "Download Saved File" triggers the browser download.
  const [savedBytes, setSavedBytes] = useState<Uint8Array | null>(null);
  const [savedFileName, setSavedFileName] = useState("");

  // ---- Find & Replace -----------------------------------------------------
  const [findOpen, setFindOpen] = useState(false);
  const [findQuery, setFindQuery] = useState("");
  const [replacement, setReplacement] = useState("");
  const [matchCase, setMatchCase] = useState(false);
  const [includeLinks, setIncludeLinks] = useState(true);
  const [matches, setMatches] = useState<SearchMatch[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(-1);
  const [searchBusy, setSearchBusy] = useState(false);
  const textCacheRef = useRef<Map<string, TextItem[]>>(new Map());

  // ---- Refs for stable history snapshots ---------------------------------
  const pagesRef = useRef(pages);
  const annotationsRef = useRef(annotations);
  const activeTextIdRef = useRef(activeTextId);
  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);
  useEffect(() => {
    annotationsRef.current = annotations;
  }, [annotations]);
  useEffect(() => {
    activeTextIdRef.current = activeTextId;
  }, [activeTextId]);

  const pushHistory = useCallback(() => {
    setHistory((prev) => [
      ...prev.slice(-49),
      { pages: pagesRef.current, annotations: annotationsRef.current },
    ]);
    // A fresh edit invalidates any forward (redo) history.
    setRedoStack([]);
  }, []);

  /** Step back: pop history, push current state to redo, restore. */
  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      // Save current state to redo before reverting.
      setRedoStack((rs) => [
        ...rs.slice(-49),
        { pages: pagesRef.current, annotations: annotationsRef.current },
      ]);
      setPages(last.pages);
      setAnnotations(last.annotations);
      return prev.slice(0, -1);
    });
    setActiveTextId(null);
  }, []);

  /** Step forward: pop redo, push current state to history, restore. */
  const redo = useCallback(() => {
    setRedoStack((rs) => {
      if (rs.length === 0) return rs;
      const next = rs[rs.length - 1];
      setHistory((h) => [
        ...h.slice(-49),
        { pages: pagesRef.current, annotations: annotationsRef.current },
      ]);
      setPages(next.pages);
      setAnnotations(next.annotations);
      return rs.slice(0, -1);
    });
    setActiveTextId(null);
  }, []);

  // Cmd/Ctrl+Z = undo, Cmd/Ctrl+Shift+Z (or Cmd/Ctrl+Y) = redo.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      const cmd = e.metaKey || e.ctrlKey;
      if (!cmd) return;
      const key = e.key.toLowerCase();
      if (key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((key === "z" && e.shiftKey) || key === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  // -------- Active text helpers -------------------------------------------

  const updateTextAnnotation = useCallback(
    (id: string, patch: Partial<TextAnnotation>) => {
      setAnnotations((prev) =>
        prev.map((a) =>
          a.id === id && a.type === "text" ? { ...a, ...patch } : a
        )
      );
    },
    []
  );

  const activateText = useCallback(
    (id: string) => {
      pushHistory();
      setActiveTextId(id);
      const ann = annotationsRef.current.find((a) => a.id === id);
      if (ann && ann.type === "text") {
        setTextColor(ann.color);
        setTextFontSize(ann.fontSize);
        setTextFontFamily(ann.fontFamily ?? "helvetica");
        setTextBold(ann.bold ?? false);
        setTextUnderline(ann.underline ?? false);
      }
    },
    [pushHistory]
  );

  const deactivateText = useCallback(() => {
    const id = activeTextIdRef.current;
    if (!id) return;
    setAnnotations((prev) => {
      const ann = prev.find((a) => a.id === id);
      if (ann && ann.type === "text" && !ann.text.trim()) {
        return prev.filter((a) => a.id !== id);
      }
      return prev;
    });
    setActiveTextId(null);
  }, []);

  // Document-level click outside → deactivate active text.
  useEffect(() => {
    if (!activeTextId) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      if (target.closest("[data-active-text]")) return;
      if (target.closest("[data-keep-text-active]")) return;
      if (target.closest("[data-text-annotation]")) return; // clicking another text — let its handler activate it
      deactivateText();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [activeTextId, deactivateText]);

  // Switching to a non-text/non-select tool deactivates editing.
  useEffect(() => {
    if (tool !== "text" && tool !== "select") {
      deactivateText();
    }
    // Picking a new drawing tool also clears any mark selection — keeps
    // the "tool exits cleanly" guarantee.
    if (tool !== "select") {
      setSelectedAnnotationId(null);
    }
  }, [tool, deactivateText]);

  // Toolbar setters that also push the change into the active text annotation.
  const applyTextColor = (c: string) => {
    setTextColor(c);
    if (activeTextId) updateTextAnnotation(activeTextId, { color: c });
  };
  const applyTextFontSize = (s: number) => {
    setTextFontSize(s);
    if (activeTextId) updateTextAnnotation(activeTextId, { fontSize: s });
  };
  const applyTextFontFamily = (f: FontFamily) => {
    setTextFontFamily(f);
    if (activeTextId) updateTextAnnotation(activeTextId, { fontFamily: f });
  };
  const applyTextBold = (b: boolean) => {
    setTextBold(b);
    if (activeTextId) updateTextAnnotation(activeTextId, { bold: b });
  };
  const applyTextUnderline = (u: boolean) => {
    setTextUnderline(u);
    if (activeTextId) updateTextAnnotation(activeTextId, { underline: u });
  };

  // -------- File loading --------------------------------------------------

  const loadPdfFile = async (
    file: File
  ): Promise<{
    sourceId: string;
    source: PageSource;
    pages: PageMeta[];
  }> => {
    const buf = await file.arrayBuffer();
    const bytes = new Uint8Array(buf.slice(0));
    const bytesForPdfjs = new Uint8Array(buf.slice(0));
    const loadingTask = pdfjsLib.getDocument({ data: bytesForPdfjs });
    const doc = await loadingTask.promise;
    const sourceId = newId();
    const metas: PageMeta[] = [];
    for (let i = 0; i < doc.numPages; i++) {
      const p = await doc.getPage(i + 1);
      const vp = p.getViewport({ scale: 1, rotation: 0 });
      const pageType = await detectPageType(doc, i);
      metas.push({
        kind: "pdf",
        sourceId,
        sourceIndex: i,
        rotation: 0,
        width: vp.width,
        height: vp.height,
        pageType,
      });
    }
    return {
      sourceId,
      source: { pdf: doc, bytes, fileName: file.name },
      pages: metas,
    };
  };

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
      const { sourceId, source, pages: newPages } = await loadPdfFile(file);
      setSources(new Map([[sourceId, source]]));
      setPages(newPages);
      setAnnotations([]);
      setHistory([]);
      setMatches([]);
      setCurrentMatchIndex(-1);
      setActiveTextId(null);
      textCacheRef.current.clear();
      setPrimaryFileName(file.name);
      setHasOpenedAnyPdf(true);
      setZoom(1.25);
    } catch (err) {
      console.error(err);
      setError(
        "Sorry, that PDF could not be opened. It may be password-protected or damaged."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) loadInitialFile(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) loadInitialFile(f);
  };

  // -------- Annotation CRUD -----------------------------------------------

  const addAnnotation = useCallback(
    (a: Annotation) => {
      pushHistory();
      setAnnotations((prev) => [...prev, a]);
    },
    [pushHistory]
  );

  const addTextAndActivate = useCallback(
    (a: TextAnnotation) => {
      pushHistory();
      setAnnotations((prev) => [...prev, a]);
      setActiveTextId(a.id);
    },
    [pushHistory]
  );

  const deleteAnnotation = useCallback(
    (id: string) => {
      pushHistory();
      setAnnotations((prev) => prev.filter((a) => a.id !== id));
      if (activeTextIdRef.current === id) setActiveTextId(null);
      setSelectedAnnotationId((cur) => (cur === id ? null : cur));
    },
    [pushHistory]
  );

  const moveAnnotation = useCallback(
    (id: string, dx: number, dy: number) => {
      if (dx === 0 && dy === 0) return;
      pushHistory();
      setAnnotations((prev) =>
        prev.map((a) => {
          if (a.id !== id) return a;
          if (a.type === "draw") {
            return {
              ...a,
              points: a.points.map((p) => ({ x: p.x + dx, y: p.y + dy })),
            };
          }
          return { ...a, x: a.x + dx, y: a.y + dy };
        })
      );
    },
    [pushHistory]
  );

  /** Update a rectangular annotation's bounds — used by the corner
   *  resize handles on X / Check marks. */
  const resizeAnnotation = useCallback(
    (
      id: string,
      rect: { x: number; y: number; width: number; height: number }
    ) => {
      pushHistory();
      setAnnotations((prev) =>
        prev.map((a) => {
          if (a.id !== id) return a;
          if (a.type === "draw" || a.type === "text") return a;
          return { ...a, x: rect.x, y: rect.y, width: rect.width, height: rect.height };
        })
      );
    },
    [pushHistory]
  );

  const updateText = useCallback(
    (id: string, text: string) => {
      // Live typing — no history per keystroke; the activation already pushed one.
      updateTextAnnotation(id, { text });
    },
    [updateTextAnnotation]
  );

  const rotatePage = useCallback(
    (displayIndex: number) => {
      pushHistory();
      setPages((prev) =>
        prev.map((p, i) =>
          i === displayIndex
            ? {
                ...p,
                rotation: (((p.rotation + 90) % 360) as PageMeta["rotation"]),
              }
            : p
        )
      );
    },
    [pushHistory]
  );

  const deletePage = useCallback(
    (displayIndex: number) => {
      pushHistory();
      setPages((prev) => prev.filter((_, i) => i !== displayIndex));
      setAnnotations((prev) =>
        prev
          .filter((a) => a.pageIndex !== displayIndex)
          .map((a) =>
            a.pageIndex > displayIndex
              ? { ...a, pageIndex: a.pageIndex - 1 }
              : a
          )
      );
      setMatches([]);
      setCurrentMatchIndex(-1);
    },
    [pushHistory]
  );

  const insertPages = useCallback(
    (afterIndex: number, newPages: PageMeta[]) => {
      pushHistory();
      const insertAt = afterIndex + 1;
      setPages((prev) => {
        const next = [...prev];
        next.splice(insertAt, 0, ...newPages);
        return next;
      });
      setAnnotations((prev) =>
        prev.map((a) =>
          a.pageIndex >= insertAt
            ? { ...a, pageIndex: a.pageIndex + newPages.length }
            : a
        )
      );
      setJustAddedIndex(insertAt);
      setMatches([]);
      setCurrentMatchIndex(-1);
    },
    [pushHistory]
  );

  // Scroll to and briefly highlight any newly-inserted page.
  useEffect(() => {
    if (justAddedIndex == null) return;
    const node = document.querySelector<HTMLElement>(
      `[data-page-index="${justAddedIndex}"]`
    );
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    const t = setTimeout(() => setJustAddedIndex(null), 1500);
    return () => clearTimeout(t);
  }, [justAddedIndex]);

  const positionToAfterIndex = (index: number, position: AddPosition) =>
    position === "above" ? index - 1 : index;

  const addBlankPage = useCallback(
    (index: number, position: AddPosition) => {
      const blank: PageMeta = {
        kind: "blank",
        rotation: 0,
        width: A4_PORTRAIT.width,
        height: A4_PORTRAIT.height,
      };
      insertPages(positionToAfterIndex(index, position), [blank]);
    },
    [insertPages]
  );

  const addPagesFromFile = useCallback(
    async (index: number, position: AddPosition, file: File) => {
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
        const { sourceId, source, pages: newPages } = await loadPdfFile(file);
        setSources((prev) => {
          const next = new Map(prev);
          next.set(sourceId, source);
          return next;
        });
        insertPages(positionToAfterIndex(index, position), newPages);
      } catch (err) {
        console.error(err);
        setError(
          "Could not load that PDF. It may be password-protected or damaged."
        );
      } finally {
        setLoading(false);
      }
    },
    [insertPages]
  );

  const reset = () => {
    if (
      hasOpenedAnyPdf &&
      !confirm("Discard the current PDF and start over?")
    )
      return;
    setSources(new Map());
    setPages([]);
    setAnnotations([]);
    setHistory([]);
    setMatches([]);
    setCurrentMatchIndex(-1);
    setActiveTextId(null);
    setSelectedAnnotationId(null);
    setPrimaryFileName("");
    setHasOpenedAnyPdf(false);
    setTool("select");
    textCacheRef.current.clear();
  };

  /**
   * Save Changes → Preview Page flow.
   *
   * Generates the exported PDF bytes, creates a blob URL, and opens a
   * full-screen Preview overlay. From the overlay the user can:
   *   - Download / Print / Email / Share (final actions)
   *   - X close → return to the editor with edits intact
   *   - ✓ confirm → trigger Download and close
   */
  const saveChanges = async () => {
    if (pages.length === 0) return;
    deactivateText();
    setExporting(true);
    setError(null);
    try {
      const sourcesForExport = new Map<string, Uint8Array>();
      for (const [id, src] of sources.entries()) {
        sourcesForExport.set(id, src.bytes);
      }
      const bytes = await exportEditedPdf({
        sources: sourcesForExport,
        pages,
        annotations,
        scale: SCALE,
      });
      const base = primaryFileName.replace(/\.pdf$/i, "") || "edited";
      const fileName = `${base}-edited.pdf`;
      setSavedBytes(bytes);
      setSavedFileName(fileName);

      // Build a blob URL for the read-only preview iframe.
      const blob = new Blob([new Uint8Array(bytes)], {
        type: "application/pdf",
      });
      // Revoke any previous preview URL.
      setPreviewUrl((old) => {
        if (old) URL.revokeObjectURL(old);
        return URL.createObjectURL(blob);
      });
    } catch (err) {
      console.error(err);
      setError("Could not save changes. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  /** Close the preview overlay, returning to the editor. */
  const closePreview = useCallback(() => {
    setPreviewUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return null;
    });
  }, []);

  /**
   * Browser back-button integration for the Preview overlay.
   *
   * When the preview opens we push a synthetic history entry tagged
   * `getpdftool-preview`. Pressing the browser back button fires a
   * `popstate` — we intercept that and close the overlay instead of
   * letting the navigation leave the page.
   *
   * If the user closes the preview via the in-app X / ✓ buttons, we
   * call history.back() ONCE to consume the synthetic entry so the
   * browser history stays clean.
   */
  useEffect(() => {
    if (!previewUrl) return;
    // Mark this synthetic entry so we can distinguish it from a true
    // user back-nav out of the page.
    const stateTag = { getpdftoolPreview: true } as const;
    window.history.pushState(stateTag, "", window.location.href);

    let consumedByPopstate = false;
    const onPop = () => {
      // Browser back was pressed → close preview (but DO NOT go back
      // again, the popstate has already consumed the synthetic entry).
      consumedByPopstate = true;
      setPreviewUrl((old) => {
        if (old) URL.revokeObjectURL(old);
        return null;
      });
    };
    window.addEventListener("popstate", onPop);

    return () => {
      window.removeEventListener("popstate", onPop);
      // If the overlay closed via the X / ✓ buttons (not popstate),
      // consume the synthetic entry so back-button still works
      // predictably on subsequent opens.
      if (!consumedByPopstate) {
        // Only step back if the current entry is still our tag.
        const cur = window.history.state as
          | { getpdftoolPreview?: boolean }
          | null;
        if (cur && cur.getpdftoolPreview) {
          window.history.back();
        }
      }
    };
  }, [previewUrl]);

  /**
   * Warn the user before they navigate away (refresh / close tab / back
   * to Google) if they have unsaved edits. The browser shows its own
   * generic "Leave site?" prompt — we can't customise the message in
   * modern browsers, but the prompt itself keeps them in the app.
   */
  useEffect(() => {
    const hasUnsavedWork =
      annotations.length > 0 || history.length > 0 || pages.length > 0;
    if (!hasUnsavedWork) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Chrome requires returnValue to be set.
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [annotations.length, history.length, pages.length]);

  /**
   * Print the current edits.
   *
   * Chrome's hidden-iframe print trick is unreliable for PDF blobs — the
   * PDF viewer runs in a separate process and `iframe.contentWindow.print()`
   * frequently no-ops. The robust pattern used by Smallpdf, iLovePDF,
   * and Acrobat Online is to open the PDF in a NEW TAB (where the
   * browser's native PDF viewer renders it) and auto-call `print()` on
   * the new window once it loads. The native PDF viewer also has its
   * own visible Print button as a manual fallback.
   *
   * Critical: window.open MUST be called synchronously inside the click
   * handler, otherwise the popup blocker kicks in. We open a blank
   * window first, then navigate it once the bytes are ready.
   */
  const printPdf = async () => {
    if (pages.length === 0) return;
    deactivateText();
    setError(null);

    // Open the popup SYNCHRONOUSLY — inside the user-gesture stack —
    // so the browser's popup blocker doesn't intervene.
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setError(
        "Your browser blocked the print popup. Please allow popups for getpdftool.com, or use Save Changes → Print from the preview."
      );
      return;
    }
    // Friendly loading state while we build the PDF.
    printWindow.document.write(
      '<!doctype html><html><head><title>Preparing print…</title>' +
        '<style>body{margin:0;font:14px -apple-system,Segoe UI,sans-serif;color:#374151;display:flex;align-items:center;justify-content:center;height:100vh}</style>' +
        '</head><body>Preparing your PDF for printing…</body></html>'
    );

    setExporting(true);
    try {
      const sourcesForExport = new Map<string, Uint8Array>();
      for (const [id, src] of sources.entries()) {
        sourcesForExport.set(id, src.bytes);
      }
      const bytes = await exportEditedPdf({
        sources: sourcesForExport,
        pages,
        annotations,
        scale: SCALE,
      });
      const blob = new Blob([new Uint8Array(bytes)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);

      // Navigate the popup to the PDF blob URL and attempt auto-print.
      // The native PDF viewer also exposes its own Print button so the
      // user always has a manual fallback.
      printWindow.addEventListener(
        "load",
        () => {
          try {
            printWindow.focus();
            printWindow.print();
          } catch (err) {
            console.warn(
              "Auto-print failed; user can use the PDF viewer's Print button.",
              err
            );
          }
        },
        { once: true }
      );
      printWindow.location.href = url;
      // Release the blob URL after a generous delay — the new tab
      // continues to hold a reference, so this just clears the original.
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      console.error(err);
      try {
        printWindow.close();
      } catch {
        /* noop */
      }
      setError("Could not prepare the PDF for printing. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  /** Download the saved PDF via the shared helper. */
  const downloadSavedFile = useCallback(() => {
    if (!savedBytes) return;
    downloadFile(savedBytes, savedFileName || "edited.pdf");
  }, [savedBytes, savedFileName]);

  /** Print the saved PDF via the shared helper. */
  const printSavedFile = useCallback(() => {
    if (!savedBytes) return;
    const err = printFile(savedBytes, savedFileName || "edited.pdf");
    if (err) setError(err);
  }, [savedBytes, savedFileName]);

  /** Share the saved PDF via the shared helper. */
  const shareSavedFile = useCallback(async () => {
    if (!savedBytes) return;
    const err = await shareFile(
      savedBytes,
      savedFileName || "edited.pdf",
      "Edited with GetPDFTool"
    );
    if (err) setError(err);
  }, [savedBytes, savedFileName]);

  // Any further edit invalidates the previously-saved bytes.
  useEffect(() => {
    setSavedBytes(null);
  }, [annotations, pages]);

  // -------- Find & Replace -------------------------------------------------

  const hasTextPages = useMemo(
    () => pages.some((p) => p.kind === "pdf" && p.pageType === "text"),
    [pages]
  );

  const getPageText = useCallback(
    async (displayIndex: number): Promise<TextItem[]> => {
      const meta = pages[displayIndex];
      if (!meta || meta.kind !== "pdf" || meta.pageType !== "text") return [];
      const key = `${meta.sourceId}:${meta.sourceIndex}:${meta.rotation}`;
      const cached = textCacheRef.current.get(key);
      if (cached) return cached;
      const pdf = sources.get(meta.sourceId)?.pdf;
      if (!pdf) return [];
      const items = await extractPageText(
        pdf,
        meta.sourceIndex,
        meta.rotation,
        SCALE
      );
      textCacheRef.current.set(key, items);
      return items;
    },
    [pages, sources]
  );

  const scrollToMatch = useCallback((m: SearchMatch) => {
    const node = document.querySelector<HTMLElement>(
      `[data-page-index="${m.pageIndex}"]`
    );
    if (node) node.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const runFind = useCallback(async () => {
    if (!findQuery) {
      setMatches([]);
      setCurrentMatchIndex(-1);
      return;
    }
    setSearchBusy(true);
    try {
      const all: SearchMatch[] = [];
      for (let i = 0; i < pages.length; i++) {
        const items = await getPageText(i);
        const pageMatches = findMatchesInPage(i, items, findQuery, matchCase);
        all.push(...pageMatches);
      }
      setMatches(all);
      const idx = all.length > 0 ? 0 : -1;
      setCurrentMatchIndex(idx);
      if (idx >= 0) scrollToMatch(all[idx]);
    } finally {
      setSearchBusy(false);
    }
  }, [findQuery, matchCase, pages, getPageText, scrollToMatch]);

  const goNextMatch = useCallback(() => {
    if (matches.length === 0) return;
    const next = (currentMatchIndex + 1) % matches.length;
    setCurrentMatchIndex(next);
    scrollToMatch(matches[next]);
  }, [matches, currentMatchIndex, scrollToMatch]);

  const goPrevMatch = useCallback(() => {
    if (matches.length === 0) return;
    const prev =
      currentMatchIndex <= 0 ? matches.length - 1 : currentMatchIndex - 1;
    setCurrentMatchIndex(prev);
    scrollToMatch(matches[prev]);
  }, [matches, currentMatchIndex, scrollToMatch]);

  const replacementAnnotationsFor = (
    m: SearchMatch,
    text: string
  ): Annotation[] => {
    const padX = Math.max(2, m.height * 0.1);
    const padY = Math.max(2, m.height * 0.18);
    const whiteout: WhiteoutAnnotation = {
      id: newId(),
      type: "whiteout",
      pageIndex: m.pageIndex,
      x: m.x - padX / 2,
      y: m.y - padY / 2,
      width: m.width + padX,
      height: m.height + padY,
    };
    const out: Annotation[] = [whiteout];
    if (text) {
      const newText: TextAnnotation = {
        id: newId(),
        type: "text",
        pageIndex: m.pageIndex,
        x: m.x,
        y: m.y,
        text,
        fontSize: m.height,
        fontFamily: "helvetica",
        bold: false,
        underline: false,
        color: "#000000",
      };
      out.push(newText);
    }
    return out;
  };

  const replaceCurrent = useCallback(() => {
    if (currentMatchIndex < 0 || currentMatchIndex >= matches.length) return;
    const m = matches[currentMatchIndex];
    const newAnns = replacementAnnotationsFor(m, replacement);

    pushHistory();
    setAnnotations((prev) => [...prev, ...newAnns]);

    const remaining = matches.filter((_, i) => i !== currentMatchIndex);
    setMatches(remaining);
    if (remaining.length === 0) {
      setCurrentMatchIndex(-1);
    } else {
      const next = currentMatchIndex >= remaining.length ? 0 : currentMatchIndex;
      setCurrentMatchIndex(next);
      scrollToMatch(remaining[next]);
    }
  }, [currentMatchIndex, matches, replacement, pushHistory, scrollToMatch]);

  const replaceAll = useCallback(() => {
    if (matches.length === 0) return;
    const allNew: Annotation[] = [];
    for (const m of matches) {
      allNew.push(...replacementAnnotationsFor(m, replacement));
    }
    pushHistory();
    setAnnotations((prev) => [...prev, ...allNew]);
    setMatches([]);
    setCurrentMatchIndex(-1);
  }, [matches, replacement, pushHistory]);

  const highlightsByPage = useMemo(() => {
    const map = new Map<
      number,
      { x: number; y: number; width: number; height: number; active: boolean }[]
    >();
    matches.forEach((m, i) => {
      const arr = map.get(m.pageIndex) ?? [];
      arr.push({
        x: m.x,
        y: m.y,
        width: m.width,
        height: m.height,
        active: i === currentMatchIndex,
      });
      map.set(m.pageIndex, arr);
    });
    return map;
  }, [matches, currentMatchIndex]);

  // -------- Empty state ---------------------------------------------------

  if (!hasOpenedAnyPdf) {
    return (
      <div className="container-narrow py-8">
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className="rounded-3xl border-2 border-dashed border-brand-300 bg-white p-8 text-center shadow-soft transition hover:border-brand-500 hover:bg-brand-50/40 sm:p-12"
        >
          <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-2xl bg-brand-600 text-white shadow-cta">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-10 w-10"
              aria-hidden="true"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm-1 7V3.5L18.5 9H13Z" />
            </svg>
          </div>
          <h2 className="font-display text-3xl font-extrabold tracking-tightish text-ink-900 sm:text-4xl">
            Drop a PDF here to start editing
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-ink-600">
            Or pick one from your computer. Files are processed in your
            browser and never uploaded to our servers.
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
              disabled={loading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              {loading ? "Opening…" : "Choose PDF file"}
            </button>
          </div>
          {error && (
            <p className="mt-4 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          {/* Feature pills */}
          <div className="mt-10 grid gap-4 border-t border-ink-100 pt-6 text-left sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: "🔒",
                title: "100% Private",
                body: "Your files never leave your device.",
              },
              {
                icon: "⚡",
                title: "Fast & Secure",
                body: "Process PDF files instantly in your browser.",
              },
              {
                icon: "✏️",
                title: "Powerful Editing",
                body: "Edit text, images, pages and much more.",
              },
              {
                icon: "📥",
                title: "Export & Download",
                body: "Download your edited PDF in seconds.",
              },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-brand-100 text-base text-brand-600">
                  {f.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink-900">
                    {f.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-ink-600">
                    {f.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const showTextStyleControls = tool === "text" || activeTextId !== null;
  const showShapeColor = tool === "draw" || tool === "rectangle";
  const showShapeStroke = tool === "draw" || tool === "rectangle";
  const showMarkStyle = tool === "cross" || tool === "check";

  return (
    <div className="container-narrow py-6">
      {/* Toolbar */}
      <div
        data-keep-text-active
        className="sticky top-16 z-30 mb-4 rounded-2xl border border-gray-100 bg-white/95 p-3 shadow-soft backdrop-blur"
      >
        <div className="flex flex-wrap items-center gap-2">
          {/* Tool buttons */}
          <div className="flex items-center gap-1">
            <ToolBtn
              active={tool === "select"}
              icon="↖"
              label="Select"
              onClick={() => setTool("select")}
            />
            {/* Text — split button */}
            <div className="flex">
              <button
                type="button"
                onClick={() => setTool("text")}
                className={`tool-btn rounded-r-none border-r-0 min-w-[60px] ${tool === "text" ? "tool-btn-active" : ""}`}
                title="Text"
              >
                <span className="text-base">T</span>
                <span>Text</span>
              </button>
              <button
                type="button"
                onClick={() => setFindOpen(true)}
                className={`tool-btn rounded-l-none px-2.5 ${tool === "text" ? "tool-btn-active" : ""}`}
                title="Find &amp; Replace"
              >
                <span className="text-lg font-bold leading-none">▾</span>
              </button>
            </div>
            <ToolBtn
              active={tool === "draw"}
              icon="✏"
              label="Draw"
              onClick={() => setTool("draw")}
            />
            <ToolBtn
              active={tool === "highlight"}
              icon="▭"
              label="Highlight"
              onClick={() => setTool("highlight")}
            />
            <ToolBtn
              active={tool === "rectangle"}
              icon="▢"
              label="Rectangle"
              onClick={() => setTool("rectangle")}
            />
            <ToolBtn
              active={tool === "whiteout"}
              icon="⬜"
              label="Whiteout"
              onClick={() => setTool("whiteout")}
            />
            <ToolBtn
              active={tool === "cross"}
              icon="✗"
              label="X"
              onClick={() => setTool("cross")}
            />
            <ToolBtn
              active={tool === "check"}
              icon="✓"
              label="Check"
              onClick={() => setTool("check")}
            />
            <ToolBtn
              active={tool === "eraser"}
              icon="⌫"
              label="Erase"
              onClick={() => setTool("eraser")}
            />
          </div>

          <div className="mx-2 h-10 w-px bg-gray-200" aria-hidden="true" />

          {/* Text style — Word-style row */}
          {showTextStyleControls && (
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={textFontFamily}
                onChange={(e) =>
                  applyTextFontFamily(e.target.value as FontFamily)
                }
                className="rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs"
                title="Font family"
              >
                {(Object.keys(FONT_LABELS) as FontFamily[]).map((f) => (
                  <option key={f} value={f}>
                    {FONT_LABELS[f]}
                  </option>
                ))}
              </select>
              <select
                value={textFontSize}
                onChange={(e) => applyTextFontSize(Number(e.target.value))}
                className="rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs"
                title="Font size"
              >
                {FONT_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => applyTextBold(!textBold)}
                className={`rounded-md border px-2.5 py-1.5 text-xs font-bold transition ${
                  textBold
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-brand-300"
                }`}
                title="Bold"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => applyTextUnderline(!textUnderline)}
                className={`rounded-md border px-2.5 py-1.5 text-xs underline transition ${
                  textUnderline
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-brand-300"
                }`}
                title="Underline"
              >
                U
              </button>
              <ColorSwatchPopover
                value={textColor}
                onChange={applyTextColor}
                palette={TEXT_COLOR_PALETTE}
                title="Text color"
              />
            </div>
          )}

          {/* Shape style controls */}
          {showShapeColor && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-gray-500">Color</span>
              {SHAPE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setShapeColor(c)}
                  className={`h-6 w-6 rounded-full border-2 transition ${
                    shapeColor === c
                      ? "border-brand-500 ring-2 ring-brand-200"
                      : "border-gray-200"
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          )}
          {showShapeStroke && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Stroke</span>
              <input
                type="range"
                min={1}
                max={20}
                value={shapeStrokeWidth}
                onChange={(e) => setShapeStrokeWidth(Number(e.target.value))}
                className="w-24"
              />
              <span className="w-6 text-xs text-gray-700">
                {shapeStrokeWidth}
              </span>
            </div>
          )}

          {/* X / Check mark style — defaults to black, gives a full
              color palette so the user can pick red, blue, etc., and a
              stroke-width slider so the mark can be made bold or thin. */}
          {showMarkStyle && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-gray-500">Color</span>
                {SHAPE_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setMarkColor(c)}
                    className={`h-6 w-6 rounded-full border-2 transition ${
                      markColor === c
                        ? "border-brand-500 ring-2 ring-brand-200"
                        : "border-gray-200"
                    }`}
                    style={{ backgroundColor: c }}
                    title={c}
                    aria-label={`Mark color ${c}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">Stroke</span>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={markStrokeWidth}
                  onChange={(e) => setMarkStrokeWidth(Number(e.target.value))}
                  className="w-24"
                />
                <span className="w-6 text-xs text-gray-700">
                  {markStrokeWidth}
                </span>
              </div>
            </>
          )}

          <div className="ml-auto flex items-center gap-2">
            {/* Zoom controls */}
            <div className="flex items-center overflow-hidden rounded-lg border border-gray-200 bg-white">
              <button
                type="button"
                onClick={zoomOut}
                disabled={zoom <= 0.5}
                className="px-2 py-1.5 text-base font-semibold text-gray-700 hover:bg-brand-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
                title="Zoom out"
              >
                −
              </button>
              <button
                type="button"
                onClick={zoomReset}
                className="min-w-[48px] border-x border-gray-200 px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700"
                title="Reset zoom (100%)"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                onClick={zoomIn}
                disabled={zoom >= 3.0}
                className="px-2 py-1.5 text-base font-semibold text-gray-700 hover:bg-brand-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
                title="Zoom in"
              >
                ＋
              </button>
            </div>
            <AddPageMenu
              mode="global"
              onAddBlank={() => addBlankPage(pages.length - 1, "below")}
              onAddFromFile={(_, file) =>
                addPagesFromFile(pages.length - 1, "below", file)
              }
            />
            {/* Undo / Redo — always visible, large, paired. */}
            <div className="flex items-stretch overflow-hidden rounded-xl border border-ink-200 bg-white shadow-soft">
              <button
                type="button"
                onClick={undo}
                disabled={history.length === 0}
                className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-ink-700 transition hover:bg-brand-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-ink-700"
                title="Undo (⌘Z / Ctrl+Z)"
                aria-label="Undo"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M3 7v6h6" />
                  <path d="M21 17a9 9 0 0 0-15-6.7L3 13" />
                </svg>
                Undo
              </button>
              <button
                type="button"
                onClick={redo}
                disabled={redoStack.length === 0}
                className="flex items-center gap-1.5 border-l border-ink-200 px-3 py-2.5 text-sm font-semibold text-ink-700 transition hover:bg-brand-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-ink-700"
                title="Redo (⇧⌘Z / Ctrl+Shift+Z)"
                aria-label="Redo"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M21 7v6h-6" />
                  <path d="M3 17a9 9 0 0 1 15-6.7L21 13" />
                </svg>
                Redo
              </button>
            </div>
            <button type="button" onClick={reset} className="btn-ghost">
              ✕ New PDF
            </button>
            <button
              type="button"
              onClick={printPdf}
              disabled={exporting || pages.length === 0}
              className="btn-ghost"
              title="Print this PDF"
            >
              🖨 Print
            </button>
            <button
              type="button"
              onClick={saveChanges}
              disabled={exporting || pages.length === 0}
              className="btn-primary"
              title="Save your edits and preview the final PDF"
            >
              {exporting ? "Saving…" : "💾 Save Changes"}
            </button>
          </div>
        </div>

        <p className="mt-2 truncate text-xs text-gray-500">
          📄 {primaryFileName} — {pages.length} page
          {pages.length === 1 ? "" : "s"}
          {loading && " · loading…"}
          {tool === "select" && (
            <span className="ml-3 text-brand-700">
              Tip: click and drag any text, drawing, highlight, rectangle or
              whiteout box to move it. Click text to re-edit.
            </span>
          )}
          {tool === "text" && (
            <span className="ml-3 text-brand-700">
              Click on the page to add text. Click an existing text to edit it.
            </span>
          )}
          {tool === "whiteout" && (
            <span className="ml-3 text-brand-700">
              Drag empty area to draw a whiteout. Drag an existing whiteout
              (blue dashed) to move it.
            </span>
          )}
          {tool === "rectangle" && (
            <span className="ml-3 text-brand-700">
              Drag empty area to draw a rectangle. Drag an existing rectangle
              to move it.
            </span>
          )}
          {tool === "highlight" && (
            <span className="ml-3 text-brand-700">
              Drag empty area to draw a highlight. Drag an existing highlight
              to move it.
            </span>
          )}
          {(tool === "cross" || tool === "check") && (
            <span className="ml-3 text-brand-700">
              Click anywhere to drop a mark. Drag its dashed box to move,
              drag a corner handle to resize.
            </span>
          )}
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

      {/* Pages — zoom applied to the entire pages container */}
      <div
        className="flex flex-col items-center gap-2"
        style={{ zoom }}
      >
        {pages.length === 0 && (
          <div className="rounded-xl bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            All pages were deleted. Use{" "}
            <strong>+ Add Page</strong> in the toolbar to insert a blank page
            or pages from another PDF — or click <strong>↶ Undo</strong> to
            bring them back.
          </div>
        )}
        {pages.map((meta, i) => {
          const pdfDoc =
            meta.kind === "pdf"
              ? sources.get(meta.sourceId)?.pdf ?? null
              : null;
          return (
            <PageCanvas
              key={`p${i}-${meta.kind}-${meta.kind === "pdf" ? meta.sourceId + ":" + meta.sourceIndex : "blank"}-r${meta.rotation}`}
              pdfDoc={pdfDoc}
              pageMeta={meta}
              pageIndex={i}
              scale={SCALE}
              zoom={zoom}
              annotations={annotations.filter((a) => a.pageIndex === i)}
              tool={tool}
              defaultColor={textColor}
              defaultFontSize={textFontSize}
              defaultFontFamily={textFontFamily}
              defaultBold={textBold}
              defaultUnderline={textUnderline}
              shapeColor={shapeColor}
              shapeStrokeWidth={shapeStrokeWidth}
              markColor={markColor}
              markStrokeWidth={markStrokeWidth}
              searchHighlights={highlightsByPage.get(i)}
              activeTextId={activeTextId}
              onAddAnnotation={addAnnotation}
              onAddTextAndActivate={addTextAndActivate}
              onResizeAnnotation={resizeAnnotation}
              onDeleteAnnotation={deleteAnnotation}
              onMoveAnnotation={moveAnnotation}
              onUpdateText={updateText}
              onActivateText={activateText}
              onFinalizeText={deactivateText}
              onResetToSelect={() => setTool("select")}
              selectedAnnotationId={selectedAnnotationId}
              onSelectAnnotation={setSelectedAnnotationId}
              onRotate={() => rotatePage(i)}
              onDelete={() => deletePage(i)}
              highlight={justAddedIndex === i}
              rightActions={
                <AddPageMenu
                  mode="page"
                  onAddBlank={(position) => addBlankPage(i, position)}
                  onAddFromFile={(position, file) =>
                    addPagesFromFile(i, position, file)
                  }
                />
              }
            />
          );
        })}
      </div>

      <FindReplaceModal
        open={findOpen}
        onClose={() => setFindOpen(false)}
        query={findQuery}
        setQuery={setFindQuery}
        replacement={replacement}
        setReplacement={setReplacement}
        matchCase={matchCase}
        setMatchCase={setMatchCase}
        includeLinks={includeLinks}
        setIncludeLinks={setIncludeLinks}
        onFind={runFind}
        onNext={goNextMatch}
        onPrev={goPrevMatch}
        onReplace={replaceCurrent}
        onReplaceAll={replaceAll}
        matchCount={matches.length}
        currentIndex={currentMatchIndex}
        hasTextPages={hasTextPages}
        busy={searchBusy}
      />

      {previewUrl && (
        <PreviewOverlay
          url={previewUrl}
          fileName={savedFileName}
          onClose={closePreview}
          onConfirm={() => {
            downloadSavedFile();
            closePreview();
          }}
          onDownload={downloadSavedFile}
          onPrint={printSavedFile}
          onShare={shareSavedFile}
        />
      )}
    </div>
  );
}

// ---------- Small inline components -----------------------------------------

function ToolBtn({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`tool-btn min-w-[60px] ${active ? "tool-btn-active" : ""}`}
      title={label}
    >
      <span className="text-base">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function ColorSwatchPopover({
  value,
  onChange,
  palette,
  title,
}: {
  value: string;
  onChange: (c: string) => void;
  palette: string[];
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={title}
        className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs hover:border-brand-300"
      >
        <span className="text-[10px] font-medium text-gray-500">A</span>
        <span
          className="block h-4 w-4 rounded border border-gray-300"
          style={{ backgroundColor: value }}
        />
        <span className="text-xs leading-none">▾</span>
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-1 w-44 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
          <div className="grid grid-cols-5 gap-1.5">
            {palette.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                }}
                className={`h-6 w-6 rounded border-2 ${
                  value === c
                    ? "border-brand-500 ring-2 ring-brand-200"
                    : "border-gray-200"
                }`}
                style={{ backgroundColor: c }}
                title={c}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Preview Overlay — full-screen read-only PDF preview shown after the user
// clicks "Save Changes". Uses an <iframe src={blob:…}> so the browser's
// native PDF viewer renders the file (pixel-accurate to what the user will
// download). Provides Download / Print / Share + an X (back to editor) and
// ✓ (confirm + download) header.
// ============================================================================

function PreviewOverlay({
  url,
  fileName,
  onClose,
  onConfirm,
  onDownload,
  onPrint,
  onShare,
}: {
  url: string;
  fileName: string;
  onClose: () => void;
  onConfirm: () => void;
  onDownload: () => void;
  onPrint: () => void;
  onShare: () => void;
}) {
  // Esc closes the preview.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-ink-900/95 backdrop-blur"
      role="dialog"
      aria-modal="true"
      aria-label="PDF preview"
    >
      {/* Header */}
      <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          {/* "Back to Edit" — labelled prominently so the user always
              knows how to get back to editing. The X icon on the right
              of the header is now redundant but kept for keyboard /
              touch convenience. */}
          <button
            type="button"
            onClick={onClose}
            title="Back to editor (Esc) — your edits are preserved"
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Edit
          </button>
          <div className="min-w-0 hidden sm:block">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
              Preview · read-only
            </div>
            <div className="truncate text-sm font-medium text-white">
              {fileName}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Action buttons */}
          <button
            type="button"
            onClick={onDownload}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            title="Download to your computer"
          >
            <span aria-hidden="true">↓</span> Download
          </button>
          <button
            type="button"
            onClick={onPrint}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            title="Open the PDF and print it"
          >
            <span aria-hidden="true">🖨</span> Print
          </button>
          <button
            type="button"
            onClick={onShare}
            className="hidden md:inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            title="Share via WhatsApp / Mail / system share menu"
          >
            <span aria-hidden="true">📤</span> Share
          </button>

          {/* Confirm — auto-download then close. */}
          <button
            type="button"
            onClick={onConfirm}
            aria-label="Confirm and download"
            title="Looks good — download now"
            className="grid h-10 w-10 place-items-center rounded-full bg-emerald-500 text-white transition hover:bg-emerald-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile-only action row — keeps Download/Print/Share visible on small screens. */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-white/10 px-4 py-2 sm:hidden">
        <button
          type="button"
          onClick={onDownload}
          title="Download to your computer"
          className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white"
        >
          ↓ Download
        </button>
        <button
          type="button"
          onClick={onPrint}
          title="Open the PDF and print it"
          className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white"
        >
          🖨 Print
        </button>
        <button
          type="button"
          onClick={onShare}
          title="Share via WhatsApp / Mail / system share menu"
          className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white"
        >
          📤 Share
        </button>
      </div>

      {/* PDF preview body — iframe pointed at the blob URL. */}
      <div className="flex-1 overflow-hidden bg-ink-800">
        <iframe
          id="preview-pdf-iframe"
          src={url}
          title="PDF preview"
          className="h-full w-full border-0"
        />
      </div>
    </div>
  );
}
