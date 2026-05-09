"use client";

import { useEffect, useRef, useState } from "react";

export type SignatureImage = {
  dataUrl: string;
  mime: "image/png" | "image/jpeg";
  aspectRatio: number;
};

const SIGNATURE_FONTS = [
  { family: "Caveat", label: "Caveat" },
  { family: "Dancing Script", label: "Dancing Script" },
  { family: "Great Vibes", label: "Great Vibes" },
  { family: "Pacifico", label: "Pacifico" },
  { family: "Sacramento", label: "Sacramento" },
  { family: "Satisfy", label: "Satisfy" },
];

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (image: SignatureImage) => void;
};

type Tab = "upload" | "draw" | "type";

export default function SignatureSourceModal({ open, onClose, onSubmit }: Props) {
  const [tab, setTab] = useState<Tab>("draw");

  // Esc closes
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 sm:items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <h3 className="text-base font-semibold text-gray-900">
            Add your signature
          </h3>
          <button
            type="button"
            onClick={onClose}
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

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-5">
          {(
            [
              { id: "draw", label: "✏️ Draw" },
              { id: "type", label: "⌨️ Type" },
              { id: "upload", label: "📁 Upload" },
            ] as { id: Tab; label: string }[]
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition ${
                tab === t.id
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Panels */}
        {tab === "draw" && (
          <DrawPanel onSubmit={onSubmit} onClose={onClose} />
        )}
        {tab === "type" && (
          <TypePanel onSubmit={onSubmit} onClose={onClose} />
        )}
        {tab === "upload" && (
          <UploadPanel onSubmit={onSubmit} onClose={onClose} />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Draw panel
// ============================================================================

function DrawPanel({
  onSubmit,
  onClose,
}: {
  onSubmit: (i: SignatureImage) => void;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [thickness, setThickness] = useState(3);
  const [color, setColor] = useState("#111827");
  const [hasStrokes, setHasStrokes] = useState(false);
  const drawingRef = useRef(false);

  // Initialize canvas with high DPR resolution.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
  }, []);

  const positionFor = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current!;
    canvas.setPointerCapture(e.pointerId);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = positionFor(e);
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.beginPath();
    ctx.moveTo(x, y);
    drawingRef.current = true;
    setHasStrokes(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = positionFor(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const onPointerUp = () => {
    drawingRef.current = false;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasStrokes(false);
  };

  const finish = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onSubmit({
      dataUrl,
      mime: "image/png",
      aspectRatio: canvas.width / canvas.height || 3,
    });
    onClose();
  };

  return (
    <div className="space-y-4 px-5 py-4">
      <p className="text-sm text-gray-600">
        Draw your signature with a mouse, finger or stylus. Use a tablet for
        best results.
      </p>

      <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-white">
        <canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerUp}
          className="block h-44 w-full touch-none"
          style={{ touchAction: "none" }}
        />
        {!hasStrokes && (
          <p className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-gray-400">
            Sign here
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-600">Thickness</span>
          <input
            type="range"
            min={1}
            max={10}
            value={thickness}
            onChange={(e) => setThickness(Number(e.target.value))}
            className="w-28"
          />
          <span className="w-4 font-semibold text-gray-700">{thickness}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-600">Colour</span>
          {["#111827", "#1d4ed8", "#0f766e", "#b91c1c"].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`h-6 w-6 rounded-full border-2 ${
                color === c ? "border-brand-500 ring-2 ring-brand-200" : "border-gray-200"
              }`}
              style={{ backgroundColor: c }}
              aria-label={c}
            />
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={clear}
            className="btn-ghost"
            disabled={!hasStrokes}
          >
            Clear
          </button>
          <button
            type="button"
            onClick={finish}
            disabled={!hasStrokes}
            className="btn-primary"
          >
            Use this signature
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Type panel
// ============================================================================

type Variant = "name" | "initials" | "both";

function TypePanel({
  onSubmit,
  onClose,
}: {
  onSubmit: (i: SignatureImage) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [initials, setInitials] = useState("");
  const [variant, setVariant] = useState<Variant>("name");
  const [fontFamily, setFontFamily] = useState(SIGNATURE_FONTS[0].family);
  const [busy, setBusy] = useState(false);

  const previewText = (() => {
    if (variant === "name") return name.trim() || "Your name";
    if (variant === "initials") return initials.trim() || "YN";
    return `${(name || "Your name").trim()}  ·  ${(initials || "YN").trim()}`;
  })();

  const usableText = (() => {
    if (variant === "name") return name.trim();
    if (variant === "initials") return initials.trim();
    return [name.trim(), initials.trim()].filter(Boolean).join("  ·  ");
  })();

  const generate = async () => {
    if (!usableText) return;
    setBusy(true);
    try {
      const fontSize = 80;
      // Make sure the font is actually loaded before measuring/painting.
      try {
        await document.fonts.load(`${fontSize}px "${fontFamily}"`);
      } catch {
        /* fonts.load isn't critical — fall back to system font if missing */
      }

      const measureCanvas = document.createElement("canvas");
      const mctx = measureCanvas.getContext("2d");
      if (!mctx) throw new Error("Canvas not supported");
      mctx.font = `${fontSize}px "${fontFamily}", cursive`;
      const metrics = mctx.measureText(usableText);

      const padding = 24;
      const width = Math.max(120, Math.ceil(metrics.width + padding * 2));
      const height = Math.ceil(fontSize * 1.6 + padding * 2);

      const dpr = 2; // sharper output for placement / printing
      const canvas = document.createElement("canvas");
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      ctx.scale(dpr, dpr);
      ctx.font = `${fontSize}px "${fontFamily}", cursive`;
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#0f172a";
      ctx.fillText(usableText, padding, height / 2);

      const dataUrl = canvas.toDataURL("image/png");
      onSubmit({
        dataUrl,
        mime: "image/png",
        aspectRatio: width / height,
      });
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4 px-5 py-4">
      {/* Inputs */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Full name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Jane Smith"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Initials
          </label>
          <input
            type="text"
            value={initials}
            onChange={(e) => setInitials(e.target.value.slice(0, 6))}
            placeholder="e.g. JS"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>
      </div>

      {/* Variant */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-medium text-gray-600">Use:</span>
        {(["name", "initials", "both"] as Variant[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setVariant(v)}
            className={`rounded-full border px-3 py-1 capitalize transition ${
              variant === v
                ? "border-brand-500 bg-brand-50 text-brand-700"
                : "border-gray-200 bg-white text-gray-600 hover:border-brand-300"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Font picker — each tile previews the chosen text in that font */}
      <div>
        <label className="mb-2 block text-xs font-medium text-gray-700">
          Pick a signature font
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          {SIGNATURE_FONTS.map((f) => {
            const selected = fontFamily === f.family;
            return (
              <button
                key={f.family}
                type="button"
                onClick={() => setFontFamily(f.family)}
                className={`group rounded-xl border-2 px-4 py-3 text-left transition ${
                  selected
                    ? "border-brand-500 bg-brand-50 ring-2 ring-brand-200"
                    : "border-gray-200 bg-white hover:border-brand-300"
                }`}
              >
                <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  {f.label}
                </div>
                <div
                  className="mt-1 truncate text-2xl text-gray-900"
                  style={{ fontFamily: `"${f.family}", cursive` }}
                >
                  {previewText}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
        <button type="button" onClick={onClose} className="btn-ghost">
          Cancel
        </button>
        <button
          type="button"
          onClick={generate}
          disabled={!usableText || busy}
          className="btn-primary"
        >
          {busy ? "Generating…" : "Use this signature"}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Upload panel
// ============================================================================

function UploadPanel({
  onSubmit,
  onClose,
}: {
  onSubmit: (i: SignatureImage) => void;
  onClose: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<SignatureImage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    const isPng =
      f.type === "image/png" || f.name.toLowerCase().endsWith(".png");
    const isJpg = f.type === "image/jpeg" || /\.(jpe?g)$/i.test(f.name);
    if (!isPng && !isJpg) {
      setError("Please pick a PNG or JPEG image.");
      return;
    }
    setError(null);
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = () => reject(new Error("Could not read the image."));
      r.readAsDataURL(f);
    });
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Could not load the image."));
      img.src = dataUrl;
    });
    setPreview({
      dataUrl,
      mime: isPng ? "image/png" : "image/jpeg",
      aspectRatio: img.naturalWidth / img.naturalHeight || 1,
    });
  };

  const finish = () => {
    if (!preview) return;
    onSubmit(preview);
    onClose();
  };

  return (
    <div className="space-y-4 px-5 py-4">
      <p className="text-sm text-gray-600">
        Upload a PNG or JPEG image of your signature. Transparent PNG works
        best — your signature blends cleanly into the document.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,.png,.jpg,.jpeg"
        className="hidden"
        onChange={onPick}
      />

      <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-6 text-center">
        {preview ? (
          <>
            <img
              src={preview.dataUrl}
              alt="Signature preview"
              className="mx-auto max-h-32"
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-3 text-xs text-brand-700 underline"
            >
              Pick a different image
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="btn-primary"
          >
            Choose image (PNG / JPEG)
          </button>
        )}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
        <button type="button" onClick={onClose} className="btn-ghost">
          Cancel
        </button>
        <button
          type="button"
          onClick={finish}
          disabled={!preview}
          className="btn-primary"
        >
          Use this signature
        </button>
      </div>
    </div>
  );
}
