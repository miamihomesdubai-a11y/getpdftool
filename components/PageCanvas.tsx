"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type {
  Annotation,
  DrawAnnotation,
  HighlightAnnotation,
  LinkAnnotation,
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
  searchHighlights?: SearchHighlight[];
  activeTextId: string | null;
  onAddAnnotation: (a: Annotation) => void;
  onAddTextAndActivate: (a: TextAnnotation) => void;
  onAddLinkAndEdit: (a: LinkAnnotation) => void;
  onEditLink: (id: string) => void;
  onDeleteAnnotation: (id: string) => void;
  onMoveAnnotation: (id: string, dx: number, dy: number) => void;
  onUpdateText: (id: string, text: string) => void;
  onActivateText: (id: string) => void;
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
      subtype: "highlight" | "rectangle" | "whiteout" | "link";
    }
  | null;

const newId = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

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
  searchHighlights,
  activeTextId,
  onAddAnnotation,
  onAddTextAndActivate,
  onAddLinkAndEdit,
  onEditLink,
  onDeleteAnnotation,
  onMoveAnnotation,
  onUpdateText,
  onActivateText,
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
      const viewport = page.getViewport({
        scale,
        rotation: pageMeta.rotation,
      });
      if (cancelled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      setSize({ w: viewport.width, h: viewport.height });
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
      tool === "whiteout" ||
      tool === "link"
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
          const ann: WhiteoutAnnotation = {
            id: newId(),
            type: "whiteout",
            pageIndex,
            x,
            y,
            width: w,
            height: h,
          };
          onAddAnnotation(ann);
        } else if (drag.subtype === "link") {
          const ann: LinkAnnotation = {
            id: newId(),
            type: "link",
            pageIndex,
            x,
            y,
            width: w,
            height: h,
            linkType: "url",
          };
          onAddLinkAndEdit(ann);
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
    // Click on a link in Link tool mode → open its properties (no drag).
    if (a.type === "link" && tool === "link") {
      return {
        pointerEvents: "all" as const,
        className: "pointer-events-auto cursor-pointer",
        onMouseDown: (e: React.MouseEvent) => {
          e.stopPropagation();
          onEditLink(a.id);
        },
      };
    }
    // Drag-to-move is allowed in Select tool, AND while the user is in
    // the same kind of tool that created the annotation.
    const matchingTool =
      (a.type === "whiteout" && tool === "whiteout") ||
      (a.type === "highlight" && tool === "highlight") ||
      (a.type === "rectangle" && tool === "rectangle");
    if (tool === "select" || matchingTool) {
      return {
        pointerEvents: "all" as const,
        className: "pointer-events-auto cursor-move",
        onMouseDown: (e: React.MouseEvent) => startMoveDrag(a.id, e),
      };
    }
    return {};
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
                  const accent =
                    isMoving ||
                    tool === "select" ||
                    tool === "eraser" ||
                    tool === "whiteout";
                  return (
                    <rect
                      key={a.id}
                      x={a.x + dx}
                      y={a.y + dy}
                      width={a.width}
                      height={a.height}
                      fill="#ffffff"
                      stroke={accent ? "#4f46e5" : "#d1d5db"}
                      strokeDasharray="4 3"
                      strokeWidth={accent ? 2 : 1}
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
                if (a.type === "link") {
                  // Visible only inside the editor (dashed brand-coloured).
                  // The exported PDF carries a real, invisible link annotation.
                  return (
                    <rect
                      key={a.id}
                      x={a.x + dx}
                      y={a.y + dy}
                      width={a.width}
                      height={a.height}
                      fill="#6366f1"
                      fillOpacity={0.08}
                      stroke="#4f46e5"
                      strokeDasharray="4 3"
                      strokeWidth={1.5}
                      {...ip}
                    />
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
                        : drag.subtype === "link"
                          ? "#6366f1"
                          : "none"
                  }
                  fillOpacity={
                    drag.subtype === "highlight"
                      ? 0.35
                      : drag.subtype === "whiteout"
                        ? 0.85
                        : drag.subtype === "link"
                          ? 0.12
                          : 0
                  }
                  stroke={
                    drag.subtype === "whiteout"
                      ? "#9ca3af"
                      : drag.subtype === "link"
                        ? "#4f46e5"
                        : shapeColor
                  }
                  strokeWidth={
                    drag.subtype === "highlight"
                      ? 0
                      : drag.subtype === "whiteout" || drag.subtype === "link"
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
