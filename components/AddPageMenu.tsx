"use client";

import { useEffect, useRef, useState } from "react";

export type AddPosition = "above" | "below";

type Props = {
  /**
   * "page"   — dropdown shows separate "Insert above" and "Insert below" sections.
   * "global" — dropdown shows a single "Add at end" section (used in toolbar).
   */
  mode?: "page" | "global";
  onAddBlank: (position: AddPosition) => void;
  onAddFromFile: (position: AddPosition, file: File) => void;
};

export default function AddPageMenu({
  mode = "page",
  onAddBlank,
  onAddFromFile,
}: Props) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const renderSection = (heading: string, position: AddPosition) => (
    <div key={position}>
      <div className="bg-gray-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
        {heading}
      </div>
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          setOpen(false);
          onAddBlank(position);
        }}
        className="flex w-full items-start gap-2 px-3 py-2 text-left text-xs hover:bg-brand-50"
      >
        <span className="text-base leading-none">📄</span>
        <span>
          <span className="block font-medium text-gray-900">Blank page</span>
          <span className="block text-[11px] text-gray-500">
            Insert an empty page
          </span>
        </span>
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={() => fileRefs.current[position]?.click()}
        className="flex w-full items-start gap-2 px-3 py-2 text-left text-xs hover:bg-brand-50"
      >
        <span className="text-base leading-none">📁</span>
        <span>
          <span className="block font-medium text-gray-900">
            Pages from PDF…
          </span>
          <span className="block text-[11px] text-gray-500">
            All pages from a PDF on your computer
          </span>
        </span>
      </button>
      <input
        ref={(el) => {
          fileRefs.current[position] = el;
        }}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          setOpen(false);
          if (f) onAddFromFile(position, f);
          e.target.value = "";
        }}
      />
    </div>
  );

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-md border border-brand-200 bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700 hover:border-brand-400 hover:bg-brand-100"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        ＋ Add Page ▾
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1 w-60 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
        >
          {mode === "page" ? (
            <>
              {renderSection("Insert above", "above")}
              {renderSection("Insert below", "below")}
            </>
          ) : (
            renderSection("Add at end", "below")
          )}
        </div>
      )}
    </div>
  );
}
