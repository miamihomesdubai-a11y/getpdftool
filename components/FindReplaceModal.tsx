"use client";

import { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  query: string;
  setQuery: (v: string) => void;
  replacement: string;
  setReplacement: (v: string) => void;
  matchCase: boolean;
  setMatchCase: (v: boolean) => void;
  includeLinks: boolean;
  setIncludeLinks: (v: boolean) => void;
  onFind: () => void; // run a fresh search and jump to first
  onNext: () => void;
  onPrev: () => void;
  onReplace: () => void;
  onReplaceAll: () => void;
  matchCount: number;
  currentIndex: number; // 0-based; -1 if none
  hasTextPages: boolean;
  busy?: boolean;
};

export default function FindReplaceModal({
  open,
  onClose,
  query,
  setQuery,
  replacement,
  setReplacement,
  matchCase,
  setMatchCase,
  includeLinks,
  setIncludeLinks,
  onFind,
  onNext,
  onPrev,
  onReplace,
  onReplaceAll,
  matchCount,
  currentIndex,
  hasTextPages,
  busy,
}: Props) {
  const findInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => findInputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const disabled = !hasTextPages;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 sm:items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <h3 className="text-base font-semibold text-gray-900">
            Find &amp; Replace
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M4.28 3.22a.75.75 0 0 0-1.06 1.06L8.94 10l-5.72 5.72a.75.75 0 1 0 1.06 1.06L10 11.06l5.72 5.72a.75.75 0 1 0 1.06-1.06L11.06 10l5.72-5.72a.75.75 0 0 0-1.06-1.06L10 8.94 4.28 3.22Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-5 py-4">
          {disabled && (
            <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Find &amp; Replace is available only for text-based PDFs. The
              current document looks scanned (images only).
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              Find
            </label>
            <input
              ref={findInputRef}
              type="text"
              value={query}
              disabled={disabled}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onFind();
                }
              }}
              placeholder="Word or phrase to find"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              Replace with
            </label>
            <input
              type="text"
              value={replacement}
              disabled={disabled}
              onChange={(e) => setReplacement(e.target.value)}
              placeholder="Replacement text (leave blank to delete)"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:bg-gray-50"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-xs text-gray-700">
              <input
                type="checkbox"
                checked={matchCase}
                disabled={disabled}
                onChange={(e) => setMatchCase(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              Match case
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-700">
              <input
                type="checkbox"
                checked={includeLinks}
                disabled={disabled}
                onChange={(e) => setIncludeLinks(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              Include links
            </label>
          </div>

          {matchCount > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-800">
              <span>
                Match <strong>{currentIndex + 1}</strong> of{" "}
                <strong>{matchCount}</strong>
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={onPrev}
                  className="rounded px-2 py-1 hover:bg-brand-100"
                >
                  ↑ Prev
                </button>
                <button
                  type="button"
                  onClick={onNext}
                  className="rounded px-2 py-1 hover:bg-brand-100"
                >
                  ↓ Next
                </button>
              </div>
            </div>
          )}

          {query && matchCount === 0 && (
            <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
              No matches yet — type a word and click <strong>Find</strong>.
            </div>
          )}

          <p className="rounded-md bg-gray-50 px-3 py-2 text-[11px] leading-relaxed text-gray-500">
            Note: replaced text is drawn over a white box using a close-matching
            system font (Helvetica). Original font and exact layout may not
            match perfectly.
          </p>
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50 px-5 py-3">
          <button
            type="button"
            onClick={onFind}
            disabled={disabled || !query || busy}
            className="btn-ghost"
          >
            Find
          </button>
          <button
            type="button"
            onClick={onReplace}
            disabled={disabled || matchCount === 0 || busy}
            className="btn-ghost"
          >
            Replace
          </button>
          <button
            type="button"
            onClick={onReplaceAll}
            disabled={disabled || !query || busy}
            className="btn-primary"
          >
            {busy ? "Working…" : "Replace all"}
          </button>
        </div>
      </div>
    </div>
  );
}
