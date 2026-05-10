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
  type LinkAnnotation,
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
import LinkPropertiesModal from "./LinkPropertiesModal";

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

  // ---- Tool + style state -------------------------------------------------
  const [tool, setTool] = useState<ToolKind>("select");
  const [shapeColor, setShapeColor] = useState("#ef4444");
  const [shapeStrokeWidth, setShapeStrokeWidth] = useState(3);

  // Text style — used as defaults for new text AND mirrored from active text.
  const [textColor, setTextColor] = useState("#111827");
  const [textFontSize, setTextFontSize] = useState(20);
  const [textFontFamily, setTextFontFamily] = useState<FontFamily>("helvetica");
  const [textBold, setTextBold] = useState(false);
  const [textUnderline, setTextUnderline] = useState(false);

  // Active text (the one being edited, if any).
  const [activeTextId, setActiveTextId] = useState<string | null>(null);

  // Link being edited in the link-properties modal.
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

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

  // Text-editor tool: text items per display page (for dotted-box overlay).
  const [textItemsByPage, setTextItemsByPage] = useState<
    Map<number, TextItem[]>
  >(new Map());

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
  }, []);

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setPages(last.pages);
      setAnnotations(last.annotations);
      return prev.slice(0, -1);
    });
    setActiveTextId(null);
  }, []);

  // Cmd/Ctrl + Z = undo
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
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo]);

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

  const addLinkAndEdit = useCallback(
    (a: LinkAnnotation) => {
      pushHistory();
      setAnnotations((prev) => [...prev, a]);
      setEditingLinkId(a.id);
    },
    [pushHistory]
  );

  const editLink = useCallback((id: string) => {
    setEditingLinkId(id);
  }, []);

  /**
   * Text-editor tool: user clicked a text run from the PDF. Whiteout the
   * original text and drop an editable text annotation in its place,
   * pre-filled with the original string.
   */
  const editTextItem = useCallback(
    (pageIndex: number, item: TextItem) => {
      const padX = Math.max(2, item.height * 0.1);
      const padY = Math.max(2, item.height * 0.18);
      const whiteoutAnn: WhiteoutAnnotation = {
        id: newId(),
        type: "whiteout",
        pageIndex,
        x: item.x - padX / 2,
        y: item.y - padY / 2,
        width: item.width + padX,
        height: item.height + padY,
      };
      const textAnn: TextAnnotation = {
        id: newId(),
        type: "text",
        pageIndex,
        x: item.x,
        y: item.y,
        text: item.str,
        fontSize: item.height,
        fontFamily: "helvetica",
        bold: false,
        underline: false,
        color: "#000000",
      };
      pushHistory();
      setAnnotations((prev) => [...prev, whiteoutAnn, textAnn]);
      // Sync the toolbar to the new active text and activate it for editing.
      setTextColor(textAnn.color);
      setTextFontSize(textAnn.fontSize);
      setTextFontFamily(textAnn.fontFamily);
      setTextBold(textAnn.bold);
      setTextUnderline(textAnn.underline);
      setActiveTextId(textAnn.id);
    },
    [pushHistory]
  );

  const updateLinkAnnotation = useCallback(
    (id: string, patch: Partial<LinkAnnotation>) => {
      setAnnotations((prev) =>
        prev.map((a) =>
          a.id === id && a.type === "link" ? { ...a, ...patch } : a
        )
      );
    },
    []
  );

  const isLinkUseless = (a: LinkAnnotation) => {
    switch (a.linkType) {
      case "url":
        return !a.url || !a.url.trim();
      case "email":
        return !a.email || !a.email.trim();
      case "phone":
        return !a.phone || !a.phone.trim();
      case "page":
        return a.pageNumber == null;
    }
  };

  const closeLinkModal = useCallback(() => {
    setEditingLinkId((id) => {
      if (!id) return null;
      // Auto-delete a link that was never given a target.
      setAnnotations((prev) => {
        const ann = prev.find((x) => x.id === id);
        if (ann && ann.type === "link" && isLinkUseless(ann)) {
          return prev.filter((x) => x.id !== id);
        }
        return prev;
      });
      return null;
    });
  }, []);

  const deleteLinkFromModal = useCallback(() => {
    if (!editingLinkId) return;
    pushHistory();
    setAnnotations((prev) => prev.filter((a) => a.id !== editingLinkId));
    setEditingLinkId(null);
  }, [editingLinkId, pushHistory]);

  const deleteAnnotation = useCallback(
    (id: string) => {
      pushHistory();
      setAnnotations((prev) => prev.filter((a) => a.id !== id));
      if (activeTextIdRef.current === id) setActiveTextId(null);
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
    setPrimaryFileName("");
    setHasOpenedAnyPdf(false);
    setTool("select");
    textCacheRef.current.clear();
  };

  /** Step 1 — generate the edited PDF bytes and stash them in state. */
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
      setSavedBytes(bytes);
      setSavedFileName(`${base}-edited.pdf`);
    } catch (err) {
      console.error(err);
      setError("Could not save changes. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  /** Print the current PDF directly from the browser. */
  const printPdf = async () => {
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
      const blob = new Blob([new Uint8Array(bytes)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      // Hidden iframe so the page itself doesn't navigate.
      const iframe = document.createElement("iframe");
      iframe.style.cssText =
        "position: fixed; right: 0; bottom: 0; width: 0; height: 0; border: 0;";
      iframe.src = url;
      iframe.onload = () => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (err) {
          console.error(err);
        }
        // Give the print dialog 60s before tearing down.
        setTimeout(() => {
          try {
            document.body.removeChild(iframe);
          } catch {
            /* already gone */
          }
          URL.revokeObjectURL(url);
        }, 60_000);
      };
      document.body.appendChild(iframe);
    } catch (err) {
      console.error(err);
      setError(
        "Could not open the print dialog. Try Save Changes then Download, then print from your browser."
      );
    } finally {
      setExporting(false);
    }
  };

  /** Build a File object from the saved bytes (or null if not saved). */
  const buildSavedFile = useCallback((): File | null => {
    if (!savedBytes) return null;
    const blob = new Blob([new Uint8Array(savedBytes)], {
      type: "application/pdf",
    });
    return new File([blob], savedFileName || "edited.pdf", {
      type: "application/pdf",
    });
  }, [savedBytes, savedFileName]);

  /** Step 2 — actually trigger the browser download. */
  const downloadSavedFile = useCallback(() => {
    const file = buildSavedFile();
    if (!file) return;
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [buildSavedFile]);

  /** Share the saved file using the system share sheet (Web Share API). */
  const shareSavedFile = useCallback(async () => {
    const file = buildSavedFile();
    if (!file) return;
    const nav = navigator as Navigator & {
      canShare?: (data: ShareData) => boolean;
    };
    if (
      typeof nav.share === "function" &&
      typeof nav.canShare === "function" &&
      nav.canShare({ files: [file] })
    ) {
      try {
        await nav.share({
          title: file.name,
          text: "Edited with GetPDFTool",
          files: [file],
        });
      } catch (err) {
        // User-cancelled share is normal; ignore.
        if ((err as Error).name !== "AbortError") {
          console.error(err);
          setError("Could not open the share menu. Please try Download instead.");
        }
      }
    } else {
      setError(
        "Sharing isn't supported in this browser. Please download the file and share it from your computer."
      );
    }
  }, [buildSavedFile]);

  /**
   * Open the user's email client with a pre-filled message and download
   * the file, since the mailto: protocol cannot carry attachments.
   */
  const emailSavedFile = useCallback(() => {
    if (!savedBytes) return;
    downloadSavedFile();
    const subject = encodeURIComponent(
      `Edited PDF — ${savedFileName || "edited.pdf"}`
    );
    const body = encodeURIComponent(
      `Hi,\n\nPlease find the edited PDF attached.\n\nNote: the file has just been downloaded to your computer. Please attach it from your Downloads folder before sending.\n\nEdited with GetPDFTool — https://www.getpdftool.com`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }, [savedBytes, savedFileName, downloadSavedFile]);

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

  // When text-editor tool is active, load text items for every text-based
  // page so the dotted overlays can render.
  useEffect(() => {
    if (tool !== "text-editor") {
      // Clear cached display items so we don't keep stale boxes around.
      if (textItemsByPage.size > 0) setTextItemsByPage(new Map());
      return;
    }
    let cancelled = false;
    (async () => {
      const next = new Map<number, TextItem[]>();
      for (let i = 0; i < pages.length; i++) {
        const items = await getPageText(i);
        if (cancelled) return;
        if (items.length > 0) next.set(i, items);
      }
      if (!cancelled) setTextItemsByPage(next);
    })();
    return () => {
      cancelled = true;
    };
    // textItemsByPage intentionally excluded — it's the output of this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool, pages, getPageText]);

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
              active={tool === "text-editor"}
              icon="✎"
              label="Text Editor"
              onClick={() => setTool("text-editor")}
            />
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
              active={tool === "link"}
              icon="🔗"
              label="Link"
              onClick={() => setTool("link")}
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
            <button
              type="button"
              onClick={undo}
              className="btn-ghost"
              disabled={history.length === 0}
              title="Undo (⌘Z / Ctrl+Z)"
            >
              ↶ Undo
            </button>
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
              disabled={exporting || pages.length === 0 || !!savedBytes}
              className="btn-primary"
              title={savedBytes ? "All edits saved" : "Save your edits"}
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
                  onClick={shareSavedFile}
                  className="flex items-center gap-1.5 border-l border-emerald-500 px-3 py-3 text-sm font-semibold transition hover:bg-emerald-700"
                  title="Share via your device's share menu"
                >
                  📤 Share
                </button>
                <button
                  type="button"
                  onClick={emailSavedFile}
                  className="flex items-center gap-1.5 border-l border-emerald-500 px-3 py-3 text-sm font-semibold transition hover:bg-emerald-700"
                  title="Open your email app to send this file"
                >
                  ✉ Email
                </button>
              </div>
            )}
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
          {tool === "link" && (
            <span className="ml-3 text-brand-700">
              Drag an area to make it a clickable link. Click an existing link
              to edit its target.
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
              searchHighlights={highlightsByPage.get(i)}
              activeTextId={activeTextId}
              textItems={
                tool === "text-editor" ? textItemsByPage.get(i) : undefined
              }
              onAddAnnotation={addAnnotation}
              onAddTextAndActivate={addTextAndActivate}
              onAddLinkAndEdit={addLinkAndEdit}
              onEditLink={editLink}
              onEditTextItem={editTextItem}
              onDeleteAnnotation={deleteAnnotation}
              onMoveAnnotation={moveAnnotation}
              onUpdateText={updateText}
              onActivateText={activateText}
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

      <LinkPropertiesModal
        open={editingLinkId !== null}
        annotation={
          (annotations.find(
            (a) => a.id === editingLinkId && a.type === "link"
          ) as LinkAnnotation | undefined) ?? null
        }
        totalPages={pages.length}
        onSave={(patch) => {
          if (editingLinkId) updateLinkAnnotation(editingLinkId, patch);
        }}
        onDelete={deleteLinkFromModal}
        onClose={closeLinkModal}
      />

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
