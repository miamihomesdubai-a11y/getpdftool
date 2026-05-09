"use client";

import { useEffect, useRef, useState } from "react";
import type { LinkAnnotation, LinkTargetType } from "@/lib/types";

type Props = {
  open: boolean;
  /** Existing annotation being edited, or a new (mostly empty) one. */
  annotation: LinkAnnotation | null;
  /** Total page count — used to validate "Link to internal page". */
  totalPages: number;
  onSave: (patch: Partial<LinkAnnotation>) => void;
  onDelete: () => void;
  onClose: () => void;
};

const ROWS: { id: LinkTargetType; label: string; placeholder: string }[] = [
  { id: "url", label: "Link to external URL", placeholder: "https://example.com" },
  { id: "email", label: "Link to email address", placeholder: "you@example.com" },
  { id: "phone", label: "Link to phone number", placeholder: "+1234567890" },
  { id: "page", label: "Link to internal page", placeholder: "2" },
];

export default function LinkPropertiesModal({
  open,
  annotation,
  totalPages,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const [linkType, setLinkType] = useState<LinkTargetType>("url");
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pageNumber, setPageNumber] = useState("");
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Hydrate from incoming annotation each time it opens.
  useEffect(() => {
    if (!open || !annotation) return;
    setLinkType(annotation.linkType);
    setUrl(annotation.url ?? "");
    setEmail(annotation.email ?? "");
    setPhone(annotation.phone ?? "");
    setPageNumber(
      annotation.pageNumber ? String(annotation.pageNumber) : ""
    );
    setTimeout(() => firstInputRef.current?.focus(), 0);
  }, [open, annotation]);

  // Esc closes
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open || !annotation) return null;

  /** Push the latest local state up to the parent. */
  const persist = (overrides?: Partial<LinkAnnotation>) => {
    onSave({
      linkType,
      url: linkType === "url" ? url : undefined,
      email: linkType === "email" ? email : undefined,
      phone: linkType === "phone" ? phone : undefined,
      pageNumber:
        linkType === "page" && pageNumber.trim()
          ? Math.max(1, Math.min(totalPages, Number(pageNumber)))
          : undefined,
      ...overrides,
    });
  };

  const handleClose = () => {
    persist();
    onClose();
  };

  return (
    <div
      data-keep-text-active
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 sm:items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <h3 className="text-base font-semibold text-gray-900">
            Link properties
          </h3>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
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

        {/* Body — radio rows */}
        <div className="space-y-3 px-5 py-4">
          {ROWS.map((row, i) => {
            const checked = linkType === row.id;
            const value =
              row.id === "url"
                ? url
                : row.id === "email"
                  ? email
                  : row.id === "phone"
                    ? phone
                    : pageNumber;
            const setValue =
              row.id === "url"
                ? setUrl
                : row.id === "email"
                  ? setEmail
                  : row.id === "phone"
                    ? setPhone
                    : setPageNumber;

            return (
              <label
                key={row.id}
                className={`flex items-start gap-3 rounded-lg border p-3 transition cursor-pointer ${
                  checked
                    ? "border-brand-400 bg-brand-50/40"
                    : "border-gray-200 bg-white hover:border-brand-300"
                }`}
              >
                <input
                  type="radio"
                  name="linkType"
                  className="mt-1 h-4 w-4 cursor-pointer accent-brand-600"
                  checked={checked}
                  onChange={() => setLinkType(row.id)}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    {row.label}
                  </div>
                  <input
                    ref={i === 0 ? firstInputRef : undefined}
                    type={row.id === "page" ? "number" : "text"}
                    inputMode={row.id === "phone" ? "tel" : undefined}
                    min={row.id === "page" ? 1 : undefined}
                    max={row.id === "page" ? totalPages : undefined}
                    placeholder={row.placeholder}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onFocus={() => setLinkType(row.id)}
                    className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  />
                </div>
              </label>
            );
          })}
          {linkType === "page" && (
            <p className="text-[11px] text-gray-500">
              Pages are numbered 1–{totalPages}.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-5 py-3">
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            🗑 Delete link
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md px-3 py-1.5 text-sm font-semibold text-brand-700 hover:bg-brand-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
