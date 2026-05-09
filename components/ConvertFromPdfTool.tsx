"use client";

import { useEffect, useRef, useState } from "react";
import { pdfjsLib } from "@/lib/pdfWorker";
import {
  pdfToDocx,
  pdfToJpg,
  pdfToPptx,
  pdfToText,
  pdfToXlsx,
  zipFiles,
} from "@/lib/convertPdf";

export type ConvertTarget = "text" | "jpg" | "docx" | "xlsx" | "pptx";

type Format = {
  ext: string;
  mime: string;
  icon: string;
  label: string;
  buttonLabel: string;
};

const FORMAT_INFO: Record<ConvertTarget, Format> = {
  text: {
    ext: "txt",
    mime: "text/plain",
    icon: "📝",
    label: "Plain text (.txt)",
    buttonLabel: "Convert to text",
  },
  jpg: {
    ext: "jpg",
    mime: "image/jpeg",
    icon: "🖼️",
    label: "JPG image (.jpg)",
    buttonLabel: "Convert to JPG",
  },
  docx: {
    ext: "docx",
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    icon: "📄",
    label: "Word (.docx)",
    buttonLabel: "Convert to Word",
  },
  xlsx: {
    ext: "xlsx",
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    icon: "📊",
    label: "Excel (.xlsx)",
    buttonLabel: "Convert to Excel",
  },
  pptx: {
    ext: "pptx",
    mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    icon: "🎯",
    label: "PowerPoint (.pptx)",
    buttonLabel: "Convert to PowerPoint",
  },
};

type Result = {
  bytes: Uint8Array;
  name: string;
  mime: string;
};

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ConvertFromPdfTool({
  target,
}: {
  target: ConvertTarget;
}) {
  const fmt = FORMAT_INFO[target];

  const [sourceBytes, setSourceBytes] = useState<Uint8Array | null>(null);
  const [fileName, setFileName] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressTotal, setProgressTotal] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  // JPG-only option: quality preset.
  const [jpgQuality, setJpgQuality] = useState<"low" | "medium" | "high">(
    "medium"
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset result when source / option changes.
  useEffect(() => {
    setResult(null);
  }, [sourceBytes, jpgQuality, target]);

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
    const bytes = new Uint8Array(buf);
    setSourceBytes(bytes);
    setFileName(file.name);
    try {
      const probeBytes = new Uint8Array(bytes.byteLength);
      probeBytes.set(bytes);
      const probe = await pdfjsLib.getDocument({ data: probeBytes }).promise;
      setPageCount(probe.numPages);
    } catch {
      setPageCount(0);
    }
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

  const reset = () => {
    setSourceBytes(null);
    setFileName("");
    setPageCount(0);
    setResult(null);
    setError(null);
  };

  const runConvert = async () => {
    if (!sourceBytes) return;
    setConverting(true);
    setError(null);
    setProgress(0);
    setProgressTotal(0);
    const onProgress = (cur: number, total: number) => {
      setProgress(cur);
      setProgressTotal(total);
    };
    try {
      const base = fileName.replace(/\.pdf$/i, "") || "converted";
      if (target === "text") {
        const text = await pdfToText(sourceBytes, onProgress);
        const bytes = new TextEncoder().encode(text);
        setResult({ bytes, name: `${base}.txt`, mime: fmt.mime });
      } else if (target === "jpg") {
        const dpi =
          jpgQuality === "low" ? 100 : jpgQuality === "medium" ? 150 : 220;
        const quality =
          jpgQuality === "low"
            ? 0.7
            : jpgQuality === "medium"
              ? 0.85
              : 0.95;
        const files = await pdfToJpg(sourceBytes, dpi, quality, onProgress);
        if (files.length === 1) {
          setResult({
            bytes: files[0].bytes,
            name: `${base}.jpg`,
            mime: "image/jpeg",
          });
        } else {
          const zip = await zipFiles(files);
          setResult({
            bytes: zip,
            name: `${base}-images.zip`,
            mime: "application/zip",
          });
        }
      } else if (target === "docx") {
        const bytes = await pdfToDocx(sourceBytes, onProgress);
        setResult({ bytes, name: `${base}.docx`, mime: fmt.mime });
      } else if (target === "xlsx") {
        const bytes = await pdfToXlsx(sourceBytes, onProgress);
        setResult({ bytes, name: `${base}.xlsx`, mime: fmt.mime });
      } else if (target === "pptx") {
        const bytes = await pdfToPptx(
          sourceBytes,
          144,
          0.85,
          onProgress
        );
        setResult({ bytes, name: `${base}.pptx`, mime: fmt.mime });
      }
    } catch (err) {
      console.error(err);
      setError(
        "Conversion failed. The PDF may be password-protected or contain unsupported content."
      );
    } finally {
      setConverting(false);
    }
  };

  const buildResultFile = (): File | null => {
    if (!result) return null;
    const blob = new Blob([new Uint8Array(result.bytes)], {
      type: result.mime,
    });
    return new File([blob], result.name, { type: result.mime });
  };

  const downloadResult = () => {
    const f = buildResultFile();
    if (!f) return;
    const url = URL.createObjectURL(f);
    const a = document.createElement("a");
    a.href = url;
    a.download = f.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareResult = async () => {
    const f = buildResultFile();
    if (!f) return;
    const nav = navigator as Navigator & {
      canShare?: (data: ShareData) => boolean;
    };
    if (
      typeof nav.share === "function" &&
      typeof nav.canShare === "function" &&
      nav.canShare({ files: [f] })
    ) {
      try {
        await nav.share({
          files: [f],
          title: f.name,
          text: "Converted with GetPDFTool",
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
    const subject = encodeURIComponent(`Converted PDF — ${result.name}`);
    const body = encodeURIComponent(
      `Hi,\n\nPlease find the converted file attached.\n\nNote: the file has just been downloaded to your computer. Please attach it from your Downloads folder before sending.\n\nConverted with GetPDFTool — https://www.getpdftool.com`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  // ----- Render -----

  if (!sourceBytes) {
    return (
      <div className="container-narrow py-10">
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className="rounded-3xl border-2 border-dashed border-brand-200 bg-white/60 p-10 text-center shadow-soft transition hover:border-brand-400 hover:bg-brand-50/60"
        >
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-2xl text-white shadow-soft">
            {fmt.icon}
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Drop a PDF to convert it to {fmt.label}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or pick one from your computer. Conversion happens in your
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

  return (
    <div className="container-narrow py-6">
      {/* File info */}
      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Original PDF
            </p>
            <p className="mt-1 text-base font-semibold text-gray-900">
              📄 {fileName}
            </p>
            <p className="mt-0.5 text-sm text-gray-600">
              <span className="font-medium">
                {formatBytes(sourceBytes.byteLength)}
              </span>
              {pageCount > 0 && (
                <span className="text-gray-500">
                  {" "}
                  · {pageCount} page{pageCount === 1 ? "" : "s"}
                </span>
              )}
            </p>
          </div>
          <button type="button" onClick={reset} className="btn-ghost">
            ✕ Choose another file
          </button>
        </div>

        {/* JPG quality option */}
        {target === "jpg" && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-medium text-gray-700">
              Image quality
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  {
                    id: "low",
                    label: "Low (small files)",
                    body: "100 DPI · q 0.70 — best for sharing online",
                  },
                  {
                    id: "medium",
                    label: "Medium",
                    body: "150 DPI · q 0.85 — recommended for most use",
                  },
                  {
                    id: "high",
                    label: "High (sharp)",
                    body: "220 DPI · q 0.95 — best for printing",
                  },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setJpgQuality(opt.id)}
                  disabled={converting}
                  className={`text-left rounded-xl border-2 p-3 transition ${
                    jpgQuality === opt.id
                      ? "border-brand-500 bg-brand-50 ring-2 ring-brand-200"
                      : "border-gray-200 bg-white hover:border-brand-300"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <span className="text-sm font-semibold text-gray-900">
                    {opt.label}
                  </span>
                  <p className="mt-1 text-[11px] leading-relaxed text-gray-600">
                    {opt.body}
                  </p>
                </button>
              ))}
            </div>
            {pageCount > 1 && (
              <p className="mt-2 text-[11px] text-gray-500">
                {pageCount} pages → you'll get a ZIP with one JPG per page.
              </p>
            )}
          </div>
        )}

        {/* Convert button */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-500">
            {target === "text"
              ? "Extracts a clean text file — perfect for searching, copy-paste or feeding into another tool."
              : target === "jpg"
                ? "Each page becomes a JPEG image. Multiple pages are zipped together."
                : target === "docx"
                  ? "Text content becomes editable paragraphs in Word. Layout is simplified to plain paragraphs."
                  : target === "xlsx"
                    ? "Each PDF page becomes a sheet. Lines become rows, words become cells based on their position."
                    : "Each PDF page becomes a high-resolution slide image — perfect visual fidelity."}
          </p>
          <button
            type="button"
            onClick={runConvert}
            disabled={converting}
            className="btn-primary"
          >
            {converting
              ? progressTotal > 0
                ? `Converting… ${progress}/${progressTotal} pages`
                : "Converting…"
              : `🚀 ${fmt.buttonLabel}`}
          </button>
        </div>
      </div>

      {error && (
        <div
          className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-center gap-2 text-emerald-800">
            <span className="text-xl">✅</span>
            <h3 className="text-base font-semibold">Conversion complete</h3>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <Metric label="Output file" value={result.name} />
            <Metric
              label="Output size"
              value={formatBytes(result.bytes.byteLength)}
              tone="brand"
            />
            <Metric
              label="Compared to original"
              value={(() => {
                const ratio = result.bytes.byteLength / sourceBytes.byteLength;
                if (ratio < 1)
                  return `${Math.round((1 - ratio) * 100)}% smaller`;
                if (ratio > 1)
                  return `${Math.round((ratio - 1) * 100)}% larger`;
                return "≈ same size";
              })()}
              tone="emerald"
            />
          </div>
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
  tone?: "brand" | "emerald";
}) {
  const toneClass =
    tone === "brand"
      ? "border-brand-200 bg-brand-50 text-brand-800"
      : tone === "emerald"
        ? "border-emerald-300 bg-white text-emerald-800"
        : "border-gray-200 bg-white text-gray-700";
  return (
    <div className={`rounded-xl border px-4 py-3 ${toneClass}`}>
      <p className="text-[11px] font-medium uppercase tracking-wider opacity-70">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-bold">{value}</p>
    </div>
  );
}
