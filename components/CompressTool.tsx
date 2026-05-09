"use client";

import { useRef, useState } from "react";
import {
  COMPRESS_LEVELS,
  compressPdf,
  formatBytes,
  type CompressLevel,
} from "@/lib/compressPdf";

export default function CompressTool() {
  const [originalBytes, setOriginalBytes] = useState<Uint8Array | null>(null);
  const [originalName, setOriginalName] = useState("");
  const [level, setLevel] = useState<CompressLevel>("medium");
  const [compressing, setCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressTotal, setProgressTotal] = useState(0);
  const [result, setResult] = useState<{
    bytes: Uint8Array;
    name: string;
    level: CompressLevel;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFile = async (file: File) => {
    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Please choose a PDF file.");
      return;
    }
    setError(null);
    const buf = await file.arrayBuffer();
    setOriginalBytes(new Uint8Array(buf));
    setOriginalName(file.name);
    setResult(null);
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) loadFile(f);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) loadFile(f);
  };

  const runCompress = async () => {
    if (!originalBytes) return;
    setCompressing(true);
    setError(null);
    setResult(null);
    setProgress(0);
    setProgressTotal(0);
    try {
      const out = await compressPdf(originalBytes, level, (cur, total) => {
        setProgress(cur);
        setProgressTotal(total);
      });
      const base = originalName.replace(/\.pdf$/i, "") || "compressed";
      setResult({
        bytes: out,
        name: `${base}-compressed.pdf`,
        level,
      });
    } catch (err) {
      console.error(err);
      setError(
        "Could not compress this PDF. It may be password-protected or damaged."
      );
    } finally {
      setCompressing(false);
    }
  };

  const reset = () => {
    setOriginalBytes(null);
    setOriginalName("");
    setResult(null);
    setError(null);
  };

  const downloadResult = () => {
    if (!result) return;
    const blob = new Blob([new Uint8Array(result.bytes)], {
      type: "application/pdf",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareResult = async () => {
    if (!result) return;
    const blob = new Blob([new Uint8Array(result.bytes)], {
      type: "application/pdf",
    });
    const file = new File([blob], result.name, { type: "application/pdf" });
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
          text: "Compressed with GetPDFTool",
          files: [file],
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError("Could not open the share menu.");
        }
      }
    } else {
      setError(
        "Sharing isn't supported in this browser. Please download instead."
      );
    }
  };

  const emailResult = () => {
    if (!result) return;
    downloadResult();
    const subject = encodeURIComponent(
      `Compressed PDF — ${result.name}`
    );
    const body = encodeURIComponent(
      `Hi,\n\nPlease find the compressed PDF attached.\n\nNote: the file has just been downloaded to your computer. Please attach it from your Downloads folder before sending.\n\nCompressed with GetPDFTool — https://www.getpdftool.com`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  // ---------- Empty state ----------
  if (!originalBytes) {
    return (
      <div className="container-narrow py-10">
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className="rounded-3xl border-2 border-dashed border-brand-200 bg-white/60 p-10 text-center shadow-soft transition hover:border-brand-400 hover:bg-brand-50/60"
        >
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-soft">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-8 w-8"
              aria-hidden="true"
            >
              <path d="M3 4a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4Zm14 14H7v-2h10v2Zm0-4H7v-2h10v2Zm-5-7V3.5L17.5 9H12Z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Drop a PDF to compress it
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or pick one from your computer. All compression happens in your
            browser — your file is never uploaded.
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
            >
              Choose PDF file
            </button>
          </div>
          {error && (
            <p className="mt-4 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  const originalSize = originalBytes.byteLength;
  const resultSize = result?.bytes.byteLength ?? 0;
  const savings = result
    ? Math.max(0, Math.round((1 - resultSize / originalSize) * 100))
    : 0;

  return (
    <div className="container-narrow py-6">
      {/* Original file info */}
      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Original file
            </p>
            <p className="mt-1 text-base font-semibold text-gray-900">
              📄 {originalName}
            </p>
            <p className="mt-0.5 text-sm text-gray-600">
              <span className="font-medium">{formatBytes(originalSize)}</span>
            </p>
          </div>
          <button type="button" onClick={reset} className="btn-ghost">
            ✕ Choose another file
          </button>
        </div>
      </div>

      {/* Level picker */}
      <h3 className="mb-3 text-sm font-semibold text-gray-900">
        Choose a compression level
      </h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {COMPRESS_LEVELS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setLevel(opt.id)}
            disabled={compressing}
            className={`text-left rounded-2xl border-2 p-4 transition ${
              level === opt.id
                ? "border-brand-500 bg-brand-50 ring-2 ring-brand-200"
                : "border-gray-200 bg-white hover:border-brand-300"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{opt.icon}</span>
              <span className="text-sm font-semibold text-gray-900">
                {opt.label}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-gray-600">
              {opt.description}
            </p>
            <p className="mt-2 text-[11px] font-medium text-brand-700">
              {opt.tradeoff}
            </p>
          </button>
        ))}
      </div>

      {/* Action row */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-gray-500">
          Compression runs in your browser. For large files this can take a
          moment per page.
        </div>
        <button
          type="button"
          onClick={runCompress}
          disabled={compressing}
          className="btn-primary"
        >
          {compressing
            ? progressTotal > 0
              ? `Compressing… ${progress}/${progressTotal} pages`
              : "Compressing…"
            : "🗜 Compress PDF"}
        </button>
      </div>

      {error && (
        <div
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-center gap-2 text-emerald-800">
            <span className="text-xl">✅</span>
            <h3 className="text-base font-semibold">Compression complete</h3>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <Metric label="Original size" value={formatBytes(originalSize)} />
            <Metric
              label="New size"
              value={formatBytes(resultSize)}
              tone="brand"
            />
            <Metric
              label="Saved"
              value={
                savings > 0
                  ? `${savings}%`
                  : resultSize <= originalSize
                    ? "≈ same"
                    : "+" +
                      Math.round((resultSize / originalSize - 1) * 100) +
                      "% larger"
              }
              tone={savings > 0 ? "emerald" : "warn"}
            />
          </div>

          {savings <= 2 && result.level === "lossless" && (
            <p className="mt-3 text-xs text-emerald-900/80">
              This PDF was already well-optimised. Try{" "}
              <button
                type="button"
                onClick={() => setLevel("medium")}
                className="underline font-semibold"
              >
                Recommended
              </button>{" "}
              or{" "}
              <button
                type="button"
                onClick={() => setLevel("strong")}
                className="underline font-semibold"
              >
                Smallest size
              </button>{" "}
              for bigger savings (image-based output).
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={downloadResult}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-emerald-700"
            >
              ↓ Download
            </button>
            <button
              type="button"
              onClick={shareResult}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white px-4 py-3 text-sm font-semibold text-emerald-800 transition hover:border-emerald-500"
            >
              📤 Share
            </button>
            <button
              type="button"
              onClick={emailResult}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white px-4 py-3 text-sm font-semibold text-emerald-800 transition hover:border-emerald-500"
            >
              ✉ Email
            </button>
            <button
              type="button"
              onClick={() => setResult(null)}
              className="btn-ghost"
            >
              Try another level
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "brand" | "emerald" | "warn";
}) {
  const toneClass =
    tone === "brand"
      ? "border-brand-200 bg-brand-50 text-brand-800"
      : tone === "emerald"
        ? "border-emerald-300 bg-white text-emerald-800"
        : tone === "warn"
          ? "border-amber-300 bg-amber-50 text-amber-800"
          : "border-gray-200 bg-white text-gray-700";
  return (
    <div className={`rounded-xl border px-4 py-3 ${toneClass}`}>
      <p className="text-[11px] font-medium uppercase tracking-wider opacity-70">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}
