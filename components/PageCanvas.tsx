"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type {
  Annotation,
  DrawAnnotation,
  HighlightAnnotation,
  MarkAnnotation,
  PageMeta,
  RectangleAnnotation,
  TextAnnotation,
  ToolKind,
  WhiteoutAnnotation,
} from "@/lib/types";
import TextAnnotationView from "./TextAnnotationView";

type SearchHighlight = {
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
};

type Props = {
  pdfDoc?: PDFDocumentProxy | null;
  pageMeta: PageMeta;
  pageIndex: number;
  scale: number;
  /** Visual zoom factor applied via CSS to the pages container. */
  zoom: number;
  annotations: Annotation[];
  tool: ToolKind;
  /** Defaults applied to a brand-new text annotation. */
  defaultColor: string;
  defaultFontSize: number;
  defaultFontFamily: TextAnnotation["fontFamily"];
  defaultBold: boolean;
  defaultUnderline: boolean;
  /** Color/strokeWidth used by NON-text drawing tools. */
  shapeColor: string;
  shapeStrokeWidth: number;
  /** Color/strokeWidth used by the X / Check tools (separate so the user
   *  can pick black for marks while keeping shapes red). */
  markColor: string;
  markStrokeWidth: number;
  searchHighlights?: SearchHighlight[];
  activeTextId: string | null;
  onAddAnnotation: (a: Annotation) => void;
  onAddTextAndActivate: (a: TextAnnotation) => void;
  /** Resize an annotation that has a rectangular bounding box. */
  onResizeAnnotation: (
    id: string,
    rect: { x: number; y: number; width: number; height: number }
  ) => void;
  onDeleteAnnotation: (id: string) => void;
  onMoveAnnotation: (id: string, dx: number, dy: number) => void;
  onUpdateText: (id: string, text: string) => void;
  onActivateText: (id: string) => void;
  /** Called when the user finishes editing a text (blur / Enter / Esc /
   *  right-click). Parent should deactivate. */
  onFinalizeText: () => void;
  /** Called when the user finalizes a placement and the active tool
   *  should auto-exit back to Select (matches Word/Acrobat behaviour:
   *  drop a mark → cursor returns to default, no second mark on the
   *  next click). */
  onResetToSelect: () => void;
  /** Currently-selected annotation (typically a mark). When set, that
   *  annotation renders its dashed bounding box + resize handles. When
   *  null, no box is shown — matches the "tool exits cleanly" UX. */
  selectedAnnotationId: string | null;
  onSelectAnnotation: (id: string | null) => void;
  onRotate: () => void;
  onDelete: () => void;
  rightActions?: React.ReactNode;
  highlight?: boolean;
};

type DragState =
  | { kind: "draw"; points: { x: number; y: number }[] }
  | {
      kind: "rect";
      x0: number;
      y0: number;
      x1: number;
      y1: number;
      subtype: "highlight" | "rectangle" | "whiteout";
    }
  | null;

const newId = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

/**
 * Sample the rendered page colour around a given rectangle so a whiteout
 * placed over text can match a coloured banner. Uses the MEDIAN of four
 * thin strips just outside the rect (top / bottom / left / right) — the
 * outside is more reliable than the inside, which is mostly ink. Falls
 * back to white if the canvas isn't ready or every strip is off-page.
 *
 * Returns "#RRGGBB" hex.
 */
function sampleBackgroundColor(
  canvas: HTMLCanvasElement | null,
  rect: { x: number; y: number; width: number; height: number },
  canvasPxPerCssPx: number
): string {
  if (!canvas) return "#ffffff";
  const ctx = canvas.getContext("2d");
  if (!ctx) return "#ffffff";
  const dpr = canvasPxPerCssPx;
  const cw = canvas.width;
  const ch = canvas.height;

  // Convert rect to canvas-bitmap coordinates.
  const rx = Math.round(rect.x * dpr);
  const ry = Math.round(rect.y * dpr);
  const rw = Math.max(1, Math.round(rect.width * dpr));
  const rh = Math.max(1, Math.round(rect.height * dpr));
  const strip = Math.max(2, Math.round(3 * dpr));

  // Four thin strips just outside the rect.
  const strips = [
    { x: rx, y: ry - strip, w: rw, h: strip }, // above
    { x: rx, y: ry + rh, w: rw, h: strip }, // below
    { x: rx - strip, y: ry, w: strip, h: rh }, // left
    { x: rx + rw, y: ry, w: strip, h: rh }, // right
  ].filter(
    (s) =>
      s.x >= 0 && s.y >= 0 && s.x + s.w <= cw && s.y + s.h <= ch && s.w > 0 && s.h > 0
  );

  const reds: number[] = [];
  const grns: number[] = [];
  const blus: number[] = [];

  try {
    for (const s of strips) {
      const d = ctx.getImageData(s.x, s.y, s.w, s.h).data;
      for (let i = 0; i < d.length; i += 4) {
        // Skip near-black pixels — they're almost certainly ink, not
        // background. (Threshold: any channel under 60 + low alpha-corrected
        // brightness.)
        const r = d[i];
        const g = d[i + 1];
        const b = d[i + 2];
        const luma = 0.299 * r + 0.587 * g + 0.114 * b;
        if (luma < 80) continue;
        reds.push(r);
        grns.push(g);
        blus.push(b);
      }
    }
  } catch {
    return "#ffffff";
  }

  if (reds.length === 0) return "#ffffff";

  // Median of each channel — robust against text glyphs that slipped past
  // the luma filter (anti-aliased mid-grey edges, etc.).
  const median = (arr: number[]) => {
    const sorted = [...arr].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  };
  const toHex = (v: number) => Math.round(v).toString(16).padStart(2, "0");
  return `#${toHex(median(reds))}${toHex(median(grns))}${toHex(median(blus))}`;
}

export default function PageCanvas({
  pdfDoc,
  pageMeta,
  pageIndex,
  scale,
  zoom,
  annotations,
  tool,
  defaultColor,
  defaultFontSize,
  defaultFontFamily,
  defaultBold,
  defaultUnderline,
  shapeColor,
  shapeStrokeWidth,
  markColor,
  markStrokeWidth,
  searchHighlights,
  activeTextId,
  onAddAnnotation,
  onAddTextAndActivate,
  onResizeAnnotation,
  onDeleteAnnotation,
  onMoveAnnotation,
  onUpdateText,
  onActivateText,
  onFinalizeText,
  onResetToSelect,
  selectedAnnotationId,
  onSelectAnnotation,
  onRotate,
  onDelete,
  rightActions,
  highlight,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [drag, setDrag] = useState<DragState>(null);
  const [moveDrag, setMoveDrag] = useState<{
    id: string;
    startX: number;
    startY: number;
    dx: number;
    dy: number;
    moved: boolean;
  } | null>(null);
  /** Active corner-handle resize on a mark (or any rectangular annotation). */
  const [resizeDrag, setResizeDrag] = useState<{
    id: string;
    /** Live rectangle, updates as the mouse moves. */
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const displaySize = (() => {
    const sideways = pageMeta.rotation === 90 || pageMeta.rotation === 270;
    return {
      w: (sideways ? pageMeta.height : pageMeta.width) * scale,
      h: (sideways ? pageMeta.width : pageMeta.height) * scale,
    };
  })();

  // Render PDF page (or set blank-page size).
  useEffect(() => {
    if (pageMeta.kind !== "pdf") {
      setSize(displaySize);
      return;
    }
    if (!pdfDoc) return;

    let cancelled = false;
    let renderTask: { promise: Promise<void>; cancel: () => void } | null = null;

    (async () => {
      const page = await pdfDoc.getPage(pageMeta.sourceIndex + 1);
      // Render at device-pixel-ratio for sharp text on retina/HiDPI screens.
      // The CANVAS bitmap is scale × DPR pixels; the CSS size stays at
      // scale pixels so annotation coordinates and overlay sizes are
      // unchanged.
      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      const viewport = page.getViewport({
        scale: scale * dpr,
        rotation: pageMeta.rotation,
      });
      if (cancelled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      // CSS display size in logical pixels — must match the overlay so
      // mouse-to-annotation maths stay consistent.
      canvas.style.width = `${Math.floor(viewport.width / dpr)}px`;
      canvas.style.height = `${Math.floor(viewport.height / dpr)}px`;
      setSize({
        w: Math.floor(viewport.width / dpr),
        h: Math.floor(viewport.height / dpr),
      });
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      renderTask = page.render({ canvasContext: ctx, viewport });
      try {
        await renderTask.promise;
      } catch {
        /* render cancelled */
      }
    })();

    return () => {
      cancelled = true;
      if (renderTask) {
        try {
          renderTask.cancel();
        } catch {
          /* noop */
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pdfDoc,
    pageMeta.kind,
    pageMeta.kind === "pdf" ? pageMeta.sourceIndex : -1,
    pageMeta.rotation,
    pageMeta.width,
    pageMeta.height,
    scale,
  ]);

  const localPoint = useCallback(
    (e: React.MouseEvent) => {
      const rect = overlayRef.current!.getBoundingClientRect();
      const z = zoom || 1;
      return {
        x: (e.clientX - rect.left) / z,
        y: (e.clientY - rect.top) / z,
      };
    },
    [zoom]
  );

  /**
   * Start a drag-to-move on an annotation. We attach mousemove/mouseup at
   * the document level so the drag survives the cursor leaving the page or
   * crossing other elements (which was making it look like the box wouldn't
   * move when you tried to drag a whiteout).
   */
  const startMoveDrag = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const startRect = overlayRef.current?.getBoundingClientRect();
      if (!startRect) return;
      const z = zoom || 1;
      const startX = (e.clientX - startRect.left) / z;
      const startY = (e.clientY - startRect.top) / z;
      let lastDx = 0;
      let lastDy = 0;
      let moved = false;

      const onMove = (ev: MouseEvent) => {
        const rect = overlayRef.current?.getBoundingClientRect();
        if (!rect) return;
        const cx = (ev.clientX - rect.left) / z;
        const cy = (ev.clientY - rect.top) / z;
        lastDx = cx - startX;
        lastDy = cy - startY;
        if (!moved && Math.hypot(lastDx, lastDy) > 2) moved = true;
        setMoveDrag({
          id,
          startX,
          startY,
          dx: lastDx,
          dy: lastDy,
          moved,
        });
      };

      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        if (moved) onMoveAnnotation(id, lastDx, lastDy);
        setMoveDrag(null);
      };

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
      setMoveDrag({ id, startX, startY, dx: 0, dy: 0, moved: false });
    },
    [zoom, onMoveAnnotation]
  );

  /**
   * Resize a rectangular annotation by dragging one of its corner handles.
   * Constrains width/height to a minimum of 8px so the box stays usable.
   */
  const startResizeDrag = useCallback(
    (
      id: string,
      corner: "nw" | "ne" | "sw" | "se",
      initial: { x: number; y: number; width: number; height: number },
      e: React.MouseEvent
    ) => {
      e.preventDefault();
      e.stopPropagation();
      const rect0 = overlayRef.current?.getBoundingClientRect();
      if (!rect0) return;
      const z = zoom || 1;
      const sx = (e.clientX - rect0.left) / z;
      const sy = (e.clientY - rect0.top) / z;
      let finalRect = initial;

      const onMove = (ev: MouseEvent) => {
        const r = overlayRef.current?.getBoundingClientRect();
        if (!r) return;
        const cx = (ev.clientX - r.left) / z;
        const cy = (ev.clientY - r.top) / z;
        const dx = cx - sx;
        const dy = cy - sy;

        let nx = initial.x;
        let ny = initial.y;
        let nw = initial.width;
        let nh = initial.height;
        if (corner === "nw") {
          nx = initial.x + dx;
          ny = initial.y + dy;
          nw = initial.width - dx;
          nh = initial.height - dy;
        } else if (corner === "ne") {
          ny = initial.y + dy;
          nw = initial.width + dx;
          nh = initial.height - dy;
        } else if (corner === "sw") {
          nx = initial.x + dx;
          nw = initial.width - dx;
          nh = initial.height + dy;
        } else {
          nw = initial.width + dx;
          nh = initial.height + dy;
        }
        if (nw < 8) {
          if (corner === "nw" || corner === "sw") nx = initial.x + initial.width - 8;
          nw = 8;
        }
        if (nh < 8) {
          if (corner === "nw" || corner === "ne") ny = initial.y + initial.height - 8;
          nh = 8;
        }
        finalRect = { x: nx, y: ny, width: nw, height: nh };
        setResizeDrag({ id, ...finalRect });
      };

      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        if (
          finalRect.x !== initial.x ||
          finalRect.y !== initial.y ||
          finalRect.width !== initial.width ||
          finalRect.height !== initial.height
        ) {
          onResizeAnnotation(id, finalRect);
        }
        setResizeDrag(null);
      };

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
      setResizeDrag({ id, ...initial });
    },
    [zoom, onResizeAnnotation]
  );

  const onMouseDown = (e: React.MouseEvent) => {
    const p = localPoint(e);

    if (tool === "text") {
      // Create a brand-new text annotation at the click point and activate it.
      const ann: TextAnnotation = {
        id: newId(),
        type: "text",
        pageIndex,
        x: p.x,
        y: p.y,
        text: "",
        fontSize: defaultFontSize,
        fontFamily: defaultFontFamily,
        bold: defaultBold,
        underline: defaultUnderline,
        color: defaultColor,
      };
      onAddTextAndActivate(ann);
      return;
    }
    if (tool === "draw") {
      setDrag({ kind: "draw", points: [p] });
      return;
    }
    if (
      tool === "highlight" ||
      tool === "rectangle" ||
      tool === "whiteout"
    ) {
      setDrag({
        kind: "rect",
        x0: p.x,
        y0: p.y,
        x1: p.x,
        y1: p.y,
        subtype: tool,
      });
      return;
    }
    if (tool === "cross" || tool === "check") {
      // Drop a 32x32 mark centred on the click point. The user can then
      // grab the dashed bounding box to drag it or grab a corner handle
      // to resize.
      const size = 32;
      const ann: MarkAnnotation = {
        id: newId(),
        type: "mark",
        pageIndex,
        x: p.x - size / 2,
        y: p.y - size / 2,
        width: size,
        height: size,
        shape: tool === "cross" ? "cross" : "check",
        color: markColor,
        strokeWidth: Math.max(2, markStrokeWidth),
      };
      onAddAnnotation(ann);
      // Select the just-placed mark so its dashed box + handles are
      // visible, and auto-exit to Select so the next click doesn't
      // drop a second mark.
      onSelectAnnotation(ann.id);
      onResetToSelect();
      return;
    }
    // Empty-area click in Select tool → clear selection (closes any
    // open dashed bounding box on marks).
    if (tool === "select" && selectedAnnotationId) {
      onSelectAnnotation(null);
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    // moveDrag is handled by document-level listeners installed in startMoveDrag.
    if (!drag) return;
    const p = localPoint(e);
    if (drag.kind === "draw") {
      setDrag({ kind: "draw", points: [...drag.points, p] });
    } else {
      setDrag({ ...drag, x1: p.x, y1: p.y });
    }
  };

  const onMouseUp = () => {
    if (!drag) return;
    if (drag.kind === "draw") {
      if (drag.points.length >= 2) {
        const ann: DrawAnnotation = {
          id: newId(),
          type: "draw",
          pageIndex,
          points: drag.points,
          color: shapeColor,
          strokeWidth: shapeStrokeWidth,
        };
        onAddAnnotation(ann);
      }
    } else {
      const x = Math.min(drag.x0, drag.x1);
      const y = Math.min(drag.y0, drag.y1);
      const w = Math.abs(drag.x1 - drag.x0);
      const h = Math.abs(drag.y1 - drag.y0);
      if (w > 3 && h > 3) {
        if (drag.subtype === "highlight") {
          const ann: HighlightAnnotation = {
            id: newId(),
            type: "highlight",
            pageIndex,
            x,
            y,
            width: w,
            height: h,
            color: "#fde047",
          };
          onAddAnnotation(ann);
        } else if (drag.subtype === "whiteout") {
          // Auto-sample the page colour underneath the whiteout so the
          // cover blends with coloured / off-white / beige backgrounds.
          const dpr =
            canvasRef.current && size && size.w > 0
              ? canvasRef.current.width / size.w
              : 1;
          const bg = sampleBackgroundColor(
            canvasRef.current,
            { x, y, width: w, height: h },
            dpr
          );
          const ann: WhiteoutAnnotation = {
            id: newId(),
            type: "whiteout",
            pageIndex,
            x,
            y,
            width: w,
            height: h,
            color: bg,
          };
          onAddAnnotation(ann);
        } else {
          const ann: RectangleAnnotation = {
            id: newId(),
            type: "rectangle",
            pageIndex,
            x,
            y,
            width: w,
            height: h,
            color: shapeColor,
            strokeWidth: shapeStrokeWidth,
          };
          onAddAnnotation(ann);
        }
      }
    }
    setDrag(null);
  };

  const cursor =
    tool === "select"
      ? "default"
      : tool === "text"
        ? "text"
        : tool === "eraser"
          ? "not-allowed"
          : "crosshair";

  // Render whiteouts BEFORE other shapes so subsequent annotations sit on top.
  const shapeAnnotations = annotations.filter((a) => a.type !== "text");
  const orderedShapes = [...shapeAnnotations].sort((a, b) => {
    const av = a.type === "whiteout" ? 0 : 1;
    const bv = b.type === "whiteout" ? 0 : 1;
    return av - bv;
  });
  const textAnnotations = annotations.filter(
    (a): a is TextAnnotation => a.type === "text"
  );

  const offsetFor = (id: string) =>
    moveDrag?.id === id ? { dx: moveDrag.dx, dy: moveDrag.dy } : { dx: 0, dy: 0 };

  /** Mouse-event props for SHAPE annotations (rect/draw/highlight/whiteout/link). */
  const shapeInteract = (a: Annotation) => {
    if (tool === "eraser") {
      return {
        pointerEvents: "all" as const,
        className: "pointer-events-auto cursor-pointer",
        onMouseDown: (e: React.MouseEvent) => {
          e.stopPropagation();
          onDeleteAnnotation(a.id);
        },
      };
    }
    // Drag-to-move is allowed in Select tool, AND while the user is in
    // the same kind of tool that created the annotation. The cross/check
    // tools share the "mark" annotation type, and both should be able to
    // move existing marks.
    const matchingTool =
      (a.type === "whiteout" && tool === "whiteout") ||
      (a.type === "highlight" && tool === "highlight") ||
      (a.type === "rectangle" && tool === "rectangle") ||
      (a.type === "mark" && (tool === "cross" || tool === "check"));
    if (tool === "select" || matchingTool) {
      return {
        pointerEvents: "all" as const,
        className: "pointer-events-auto cursor-move",
        onMouseDown: (e: React.MouseEvent) => {
          // Marks: clicking selects them (so the dashed box + handles
          // reappear). Other shape types are not "selectable" in the
          // bounding-box sense — they just drag.
          if (a.type === "mark") onSelectAnnotation(a.id);
          startMoveDrag(a.id, e);
        },
      };
    }
    return {};
  };

  /**
   * Should the dashed bounding box + corner resize handles be shown for
   * this annotation? Only when the user has explicitly SELECTED the
   * mark (just placed it, or clicked it). Otherwise the mark renders
   * clean — no box, no handles — matching professional editors.
   */
  const showResizeBox = (a: Annotation): boolean => {
    if (a.type !== "mark") return false;
    return a.id === selectedAnnotationId;
  };

  /** What clicking a text annotation should do, given current tool. */
  const textToolMode: "activate" | "delete" | "ignore" =
    tool === "eraser" ? "delete" : tool === "select" || tool === "text" ? "activate" : "ignore";

  return (
    <div
      data-page-index={pageIndex}
      className={`relative my-6 inline-block rounded-2xl transition-all duration-700 ${
        highlight ? "ring-4 ring-brand-400 ring-offset-4" : "ring-0"
      }`}
    >
      {/* Page chrome */}
      <div className="mb-2 flex items-center justify-between gap-3 text-xs text-gray-500">
        <span className="font-medium">
          Page {pageIndex + 1}
          {pageMeta.kind === "blank" && (
            <span className="ml-2 rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-semibold text-brand-700">
              BLANK
            </span>
          )}
          {pageMeta.kind === "pdf" && pageMeta.pageType === "scanned" && (
            <span
              className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700"
              title="No selectable text — scanned/image page"
            >
              SCANNED
            </span>
          )}
          {pageMeta.kind === "pdf" && pageMeta.pageType === "text" && (
            <span
              className="ml-2 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700"
              title="Searchable text layer"
            >
              TEXT
            </span>
          )}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onRotate}
            className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs hover:border-brand-300 hover:text-brand-700"
            type="button"
          >
            ↻ Rotate
          </button>
          <button
            onClick={onDelete}
            className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs hover:border-red-300 hover:text-red-700"
            type="button"
          >
            🗑 Delete
          </button>
          {rightActions}
        </div>
      </div>

      <div
        className="pdf-page-wrapper"
        style={
          pageMeta.kind === "blank" && size
            ? { width: size.w, height: size.h, background: "white" }
            : undefined
        }
      >
        {pageMeta.kind === "pdf" && <canvas ref={canvasRef} />}

        {size && (
          <div
            ref={overlayRef}
            className="pdf-overlay"
            style={{ width: size.w, height: size.h, cursor }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onContextMenu={(e) => {
              // Right-click anywhere finalizes the current placement.
              // No browser menu appears. If a text is being edited, blur
              // it (which deactivates via onFinalize). Then exit the
              // active tool back to Select AND clear mark selection —
              // matches the spec: right-click ends the lifecycle cleanly
              // and the dashed bounding box on marks disappears.
              e.preventDefault();
              if (activeTextId) {
                const el = document.activeElement as HTMLElement | null;
                if (el && typeof el.blur === "function") el.blur();
              }
              if (tool !== "select") onResetToSelect();
              if (selectedAnnotationId) onSelectAnnotation(null);
            }}
          >
            {/* Shape annotations + search highlights + drag preview (SVG) */}
            <svg
              width={size.w}
              height={size.h}
              className="pointer-events-none absolute inset-0"
            >
              {orderedShapes.map((a) => {
                const ip = shapeInteract(a);
                const { dx, dy } = offsetFor(a.id);
                const isMoving = moveDrag?.id === a.id && moveDrag.moved;

                if (a.type === "whiteout") {
                  // Only outline the whiteout when the user needs to see it
                  // to interact with it — i.e. while actively dragging it,
                  // or when the Whiteout / Eraser tool is selected. In every
                  // other mode (Select, Text, Text Editor, Draw, …) the
                  // whiteout is rendered as a "blank patch of paper" with
                  // no visible border, so it doesn't clutter the text the
                  // user is reading on top of it.
                  const showOutline =
                    isMoving || tool === "whiteout" || tool === "eraser";
                  return (
                    <rect
                      key={a.id}
                      x={a.x + dx}
                      y={a.y + dy}
                      width={a.width}
                      height={a.height}
                      fill={a.color ?? "#ffffff"}
                      stroke={showOutline ? (isMoving ? "#dc2626" : "#d1d5db") : "transparent"}
                      strokeDasharray={showOutline ? "4 3" : undefined}
                      strokeWidth={showOutline ? (isMoving ? 2 : 1) : 0}
                      {...ip}
                    />
                  );
                }
                if (a.type === "highlight") {
                  return (
                    <rect
                      key={a.id}
                      x={a.x + dx}
                      y={a.y + dy}
                      width={a.width}
                      height={a.height}
                      fill={a.color}
                      fillOpacity={0.35}
                      stroke={isMoving ? "#4f46e5" : "none"}
                      strokeWidth={isMoving ? 1.5 : 0}
                      {...ip}
                    />
                  );
                }
                if (a.type === "rectangle") {
                  return (
                    <rect
                      key={a.id}
                      x={a.x + dx}
                      y={a.y + dy}
                      width={a.width}
                      height={a.height}
                      fill="none"
                      stroke={a.color}
                      strokeWidth={a.strokeWidth}
                      {...ip}
                    />
                  );
                }
                if (a.type === "mark") {
                  // Live rect — use resizeDrag preview when active, else
                  // fall back to the stored rect + move-drag offset.
                  const live =
                    resizeDrag?.id === a.id
                      ? {
                          x: resizeDrag.x,
                          y: resizeDrag.y,
                          width: resizeDrag.width,
                          height: resizeDrag.height,
                        }
                      : {
                          x: a.x + dx,
                          y: a.y + dy,
                          width: a.width,
                          height: a.height,
                        };
                  const x0 = live.x;
                  const y0 = live.y;
                  const w = live.width;
                  const h = live.height;
                  const withBox = showResizeBox(a);

                  // Inner shape (X or ✓)
                  let shapeEl: JSX.Element;
                  if (a.shape === "cross") {
                    // Inset the strokes a touch so the X sits cleanly inside
                    // the dashed bounding box, like Microsoft Word's marks.
                    const inset = Math.min(w, h) * 0.12;
                    shapeEl = (
                      <g {...ip}>
                        <line
                          x1={x0 + inset}
                          y1={y0 + inset}
                          x2={x0 + w - inset}
                          y2={y0 + h - inset}
                          stroke={a.color}
                          strokeWidth={a.strokeWidth}
                          strokeLinecap="round"
                        />
                        <line
                          x1={x0 + w - inset}
                          y1={y0 + inset}
                          x2={x0 + inset}
                          y2={y0 + h - inset}
                          stroke={a.color}
                          strokeWidth={a.strokeWidth}
                          strokeLinecap="round"
                        />
                      </g>
                    );
                  } else {
                    const p1x = x0 + w * 0.15;
                    const p1y = y0 + h * 0.55;
                    const p2x = x0 + w * 0.4;
                    const p2y = y0 + h * 0.85;
                    const p3x = x0 + w * 0.85;
                    const p3y = y0 + h * 0.15;
                    shapeEl = (
                      <polyline
                        points={`${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y}`}
                        fill="none"
                        stroke={a.color}
                        strokeWidth={a.strokeWidth}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        {...ip}
                      />
                    );
                  }

                  if (!withBox) {
                    return <g key={a.id}>{shapeEl}</g>;
                  }

                  // Dashed bounding box + corner resize handles.
                  const corners: {
                    cx: number;
                    cy: number;
                    name: "nw" | "ne" | "sw" | "se";
                    cursor: string;
                  }[] = [
                    { cx: x0, cy: y0, name: "nw", cursor: "nwse-resize" },
                    { cx: x0 + w, cy: y0, name: "ne", cursor: "nesw-resize" },
                    { cx: x0, cy: y0 + h, name: "sw", cursor: "nesw-resize" },
                    { cx: x0 + w, cy: y0 + h, name: "se", cursor: "nwse-resize" },
                  ];

                  return (
                    <g key={a.id}>
                      {/* Dashed bounding box — itself draggable. */}
                      <rect
                        x={x0}
                        y={y0}
                        width={w}
                        height={h}
                        fill="transparent"
                        stroke="#dc2626"
                        strokeDasharray="4 3"
                        strokeWidth={1}
                        {...ip}
                      />
                      {shapeEl}
                      {corners.map((cn) => (
                        <rect
                          key={cn.name}
                          x={cn.cx - 4}
                          y={cn.cy - 4}
                          width={8}
                          height={8}
                          fill="#ffffff"
                          stroke="#dc2626"
                          strokeWidth={1.5}
                          style={{ cursor: cn.cursor, pointerEvents: "all" }}
                          onMouseDown={(e) =>
                            startResizeDrag(
                              a.id,
                              cn.name,
                              { x: a.x, y: a.y, width: a.width, height: a.height },
                              e
                            )
                          }
                        />
                      ))}
                    </g>
                  );
                }
                if (a.type === "draw") {
                  const d = a.points
                    .map(
                      (p, i) =>
                        `${i === 0 ? "M" : "L"}${(p.x + dx).toFixed(1)} ${(p.y + dy).toFixed(1)}`
                    )
                    .join(" ");
                  return (
                    <path
                      key={a.id}
                      d={d}
                      fill="none"
                      stroke={a.color}
                      strokeWidth={a.strokeWidth}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      {...ip}
                    />
                  );
                }
                return null;
              })}

              {/* Search match highlights */}
              {searchHighlights?.map((h, idx) => (
                <rect
                  key={`s${idx}`}
                  x={h.x - 1}
                  y={h.y - 1}
                  width={h.width + 2}
                  height={h.height + 2}
                  fill={h.active ? "#fb923c" : "#fde68a"}
                  fillOpacity={h.active ? 0.55 : 0.45}
                  stroke={h.active ? "#ea580c" : "#f59e0b"}
                  strokeWidth={1.5}
                />
              ))}

              {/* Live preview while dragging */}
              {drag?.kind === "draw" && drag.points.length > 1 && (
                <path
                  d={drag.points
                    .map(
                      (p, i) =>
                        `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`
                    )
                    .join(" ")}
                  fill="none"
                  stroke={shapeColor}
                  strokeWidth={shapeStrokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {drag?.kind === "rect" && (
                <rect
                  x={Math.min(drag.x0, drag.x1)}
                  y={Math.min(drag.y0, drag.y1)}
                  width={Math.abs(drag.x1 - drag.x0)}
                  height={Math.abs(drag.y1 - drag.y0)}
                  fill={
                    drag.subtype === "highlight"
                      ? "#fde047"
                      : drag.subtype === "whiteout"
                        ? "#ffffff"
                        : "none"
                  }
                  fillOpacity={
                    drag.subtype === "highlight"
                      ? 0.35
                      : drag.subtype === "whiteout"
                        ? 0.85
                        : 0
                  }
                  stroke={
                    drag.subtype === "whiteout" ? "#9ca3af" : shapeColor
                  }
                  strokeWidth={
                    drag.subtype === "highlight"
                      ? 0
                      : drag.subtype === "whiteout"
                        ? 1.5
                        : shapeStrokeWidth
                  }
                  strokeDasharray={
                    drag.subtype === "rectangle" ? undefined : "4 4"
                  }
                />
              )}
            </svg>

            {/* Text annotations layer (HTML, sits above the SVG) */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{ width: size.w, height: size.h }}
            >
              {textAnnotations.map((t) => (
                <TextAnnotationView
                  key={t.id}
                  annotation={t}
                  isActive={activeTextId === t.id}
                  dragOffset={offsetFor(t.id)}
                  onActivate={() => onActivateText(t.id)}
                  onDelete={() => onDeleteAnnotation(t.id)}
                  onUpdateText={(text) => onUpdateText(t.id, text)}
                  onMoveStart={(e) => startMoveDrag(t.id, e)}
                  onFinalize={onFinalizeText}
                  toolMode={textToolMode}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
