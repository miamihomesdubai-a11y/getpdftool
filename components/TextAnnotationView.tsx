"use client";

import { useEffect, useRef } from "react";
import type { FontFamily, TextAnnotation } from "@/lib/types";

const FONT_CSS: Record<FontFamily, string> = {
  helvetica: 'Helvetica, Arial, "Liberation Sans", sans-serif',
  times: '"Times New Roman", Times, "Liberation Serif", serif',
  courier: '"Courier New", Courier, "Liberation Mono", monospace',
};

type Props = {
  annotation: TextAnnotation;
  isActive: boolean;
  dragOffset: { dx: number; dy: number };
  /** What clicking the text should do, given the active tool. */
  onActivate: () => void;
  onDelete: () => void;
  onUpdateText: (text: string) => void;
  onMoveStart: (e: React.MouseEvent) => void;
  /** "select" | "text" | "eraser" | other — drives click behavior. */
  toolMode: "activate" | "delete" | "ignore";
};

export default function TextAnnotationView({
  annotation: a,
  isActive,
  dragOffset,
  onActivate,
  onDelete,
  onUpdateText,
  onMoveStart,
  toolMode,
}: Props) {
  const editorRef = useRef<HTMLDivElement>(null);

  /** Sync external text changes into the contentEditable, but never while
   * the user is actively typing in it. */
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (document.activeElement === el) return;
    if (el.innerText !== a.text) {
      el.innerText = a.text;
    }
  }, [a.text, isActive]);

  /** When this text becomes active, focus and place cursor at the end. */
  useEffect(() => {
    if (!isActive) return;
    const el = editorRef.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      el.focus();
      // Place caret at the end of the content
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    });
    return () => cancelAnimationFrame(id);
  }, [isActive]);

  const baseFontStyle: React.CSSProperties = {
    fontFamily: FONT_CSS[a.fontFamily ?? "helvetica"],
    fontSize: a.fontSize,
    color: a.color,
    fontWeight: a.bold ? "bold" : "normal",
    textDecoration: a.underline ? "underline" : "none",
    lineHeight: 1.15,
    whiteSpace: "pre-wrap",
  };

  const wrapperStyle: React.CSSProperties = {
    position: "absolute",
    left: a.x + dragOffset.dx,
    top: a.y + dragOffset.dy,
    pointerEvents: "auto",
    cursor: isActive ? "text" : toolMode === "delete" ? "pointer" : "pointer",
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isActive) return; // already editing; let click pass to caret positioning
    e.stopPropagation();
    if (toolMode === "delete") onDelete();
    else if (toolMode === "activate") onActivate();
  };

  return (
    <div
      data-text-annotation
      data-active-text={isActive ? "1" : undefined}
      style={wrapperStyle}
      onMouseDown={handleClick}
    >
      {/* Drag handle (only visible while active) */}
      {isActive && (
        <div
          onMouseDown={(e) => {
            e.stopPropagation();
            onMoveStart(e);
          }}
          title="Drag to move"
          className="absolute -left-1 -top-6 flex h-5 cursor-move select-none items-center gap-1 rounded-t-md bg-brand-600 px-2 text-[10px] font-semibold text-white"
        >
          ✥ drag
        </div>
      )}

      {/* The text itself: editable when active, plain when not. */}
      {isActive ? (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={(e) =>
            onUpdateText((e.currentTarget as HTMLDivElement).innerText)
          }
          onKeyDown={(e) => {
            // Don't let Backspace etc. bubble to global handlers.
            e.stopPropagation();
          }}
          style={{
            ...baseFontStyle,
            outline: "none",
            border: "1px dashed #4f46e5",
            background: "transparent",
            padding: "1px 4px",
            minWidth: 60,
            minHeight: "1em",
          }}
        />
      ) : (
        <div style={baseFontStyle}>{a.text}</div>
      )}
    </div>
  );
}
