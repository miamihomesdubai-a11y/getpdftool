"use client";

import { useEffect, useRef } from "react";
import type { FontFamily, TextAnnotation } from "@/lib/types";

const FONT_CSS: Record<FontFamily, string> = {
  helvetica: 'Arial, Helvetica, "Liberation Sans", sans-serif',
  times: '"Times New Roman", Times, "Liberation Serif", serif',
  courier: '"Courier New", Courier, "Liberation Mono", monospace',
  // The TTF files in /public/fonts are also loaded as web @font-face
  // (see app/globals.css) so on-screen text matches the exported PDF.
  roboto: 'Roboto, Arial, sans-serif',
  poppins: 'Poppins, "Helvetica Neue", Arial, sans-serif',
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
  /** Called when the contentEditable blurs — parent should deactivate. */
  onFinalize: () => void;
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
  onFinalize,
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

  /** Right-click inside an active text finalizes the edit (blur the
   *  contenteditable, which the parent listens for to deactivate). */
  const handleContextMenu = (e: React.MouseEvent) => {
    if (!isActive) return;
    e.preventDefault();
    e.stopPropagation();
    const el = editorRef.current;
    if (el) el.blur();
  };

  return (
    <div
      data-text-annotation
      data-active-text={isActive ? "1" : undefined}
      style={wrapperStyle}
      onMouseDown={handleClick}
      onContextMenu={handleContextMenu}
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

      {/*
        The text itself: editable when active, plain when not. Both states
        use IDENTICAL box geometry (same padding + 1px border) so the text
        glyphs do not jump when the user commits an edit — the only thing
        that changes is the border colour (dashed brand red ↔ transparent).
      */}
      {isActive ? (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={(e) =>
            onUpdateText((e.currentTarget as HTMLDivElement).innerText)
          }
          onBlur={(e) => {
            // If focus moved into the toolbar (font dropdown, bold,
            // color picker, …) DON'T finalize — the user is changing
            // the active text's style. The toolbar is tagged with
            // data-keep-text-active and same for other safe zones.
            const next = e.relatedTarget as HTMLElement | null;
            const inToolbar =
              next && next.closest && next.closest("[data-keep-text-active]");
            if (inToolbar) {
              // Native form elements (<select>) MUST keep their focus
              // while the dropdown is open — refocusing the editor
              // would close the dropdown instantly. For everything
              // else (buttons, swatches) we silently steal focus back
              // so the caret continues blinking and the user can keep
              // typing.
              const tag = (next as HTMLElement).tagName;
              const isFormControl =
                tag === "SELECT" || tag === "INPUT" || tag === "OPTION";
              if (!isFormControl) {
                setTimeout(() => editorRef.current?.focus(), 0);
              }
              return;
            }
            onFinalize();
          }}
          onKeyDown={(e) => {
            // Don't let Backspace etc. bubble to global handlers.
            e.stopPropagation();
            // Escape / Enter (without shift) finalizes the edit.
            if (e.key === "Escape" || (e.key === "Enter" && !e.shiftKey)) {
              e.preventDefault();
              (e.currentTarget as HTMLDivElement).blur();
            }
          }}
          style={{
            ...baseFontStyle,
            outline: "none",
            border: "1px dashed #dc2626",
            background: "transparent",
            padding: "1px 4px",
            minWidth: 60,
            minHeight: "1em",
            boxSizing: "border-box",
          }}
        />
      ) : (
        <div
          style={{
            ...baseFontStyle,
            border: "1px solid transparent",
            padding: "1px 4px",
            boxSizing: "border-box",
          }}
        >
          {a.text}
        </div>
      )}
    </div>
  );
}
