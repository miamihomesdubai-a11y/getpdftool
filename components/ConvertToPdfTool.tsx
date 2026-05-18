"use client";

import { useEffect, useRef, useState } from "react";
import {
  excelToPdf,
  htmlFileToPdf,
  htmlToPdf,
  imagesToPdf,
  wordToPdf,
} from "@/lib/convertToPdf";
import { downloadFile, printFile, shareFile } from "@/lib/fileActions";

export type Source = "jpeg" | "html" | "word" | "excel";

const SOURCE_INFO: Record<
  Source,
  {
    icon: string;
    label: string;
    accept: string;
    multiple: boolean;
    buttonLabel: string;
    description: string;
  }
> = {
  jpeg: {
    icon: "🖼️",
    label: "image",
    accept: "image/jpeg,image/png,.jpg,.jpeg,.png",
    multiple: true,
    buttonLabel: "Convert to PDF",
    description:
      "Upload one or many JPEG / PNG images. Each image becomes a PDF page at full resolution.",
  },
  html: {
    icon: "🌐",
    label: "HTML",
    accept: "text/html,.html,.htm",
    multiple: false,
    buttonLabel: "Convert to PDF",
    description:
      "Paste HTML below or upload an .html file. The page is rendered in your browser and saved as PDF.",
  },
  word: {
    icon: "📄",
    label: "Word",
    accept:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx",
    multiple: false,
    buttonLabel: "Convert to PDF",
    description:
      "Upload a .docx file. We convert the document to clean HTML, then render it as PDF.",
  },
  excel: {
    icon: "📊",
    label: "Excel",
    accept:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx,.xls",
    multiple: false,
    buttonLabel: "Convert to PDF",
    description:
      "Upload a .xlsx workbook. Every sheet is rendered as a table on its own page.",
  },
};

type Result = { bytes: Uint8Array; name: string };

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ConvertToPdfTool({ source }: { source: Source }) {
  const cfg = SOURCE_INFO[source];

  // Inputs
  const [files, setFiles] = useState<File[]>([]);
  const [htmlText, setHtmlText] = useState<string>("");
  const [htmlMode, setHtmlMode] = useState<"paste" | "file">("paste");

  // Output
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressTotal, setProgressTotal] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setResult(null);
  }, [files, htmlText, htmlMode, source]);

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (cfg.multiple) {
      setFiles((prev) => [...prev, ...list]);
    } else {
      setFiles(list.slice(0, 1));
    }
    setError(null);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const list = Array.from(e.dataTransfer.files ?? []);
    if (cfg.multiple) {
      setFiles((prev) => [...prev, ...list]);
    } else {
      setFiles(list.slice(0, 1));
    }
    setError(null);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const moveFile = (index: number, dir: -1 | 1) => {
    setFiles((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const reset = () => {
    setFiles([]);
    setHtmlText("");
    setResult(null);
    setError(null);
  };

  const isInputReady = (() => {
    if (source === "html" && htmlMode === "paste") return htmlText.trim().length > 0;
    return files.length > 0;
  })();

  const baseName = (() => {
    if (files[0]) return files[0].name.replace(/\.[^.]+$/, "") || "document";
    if (source === "html") return "page";
    return "document";
  })();

  const runConvert = async () => {
    setConverting(true);
    setError(null);
    setProgress(0);
    setProgressTotal(0);
    const onProgress = (cur: number, total: number) => {
      setProgress(cur);
      setProgressTotal(total);
    };
    try {
      let bytes: Uint8Array;
      if (source === "jpeg") {
        bytes = await imagesToPdf(files, onProgress);
      } else if (source === "html") {
        if (htmlMode === "paste") {
          bytes = await htmlToPdf(htmlText, onProgress);
        } else {
          if (!files[0]) throw new Error("No file selected.");
          bytes = await htmlFileToPdf(files[0], onProgress);
        }
      } else if (source === "word") {
        if (!files[0]) throw new Error("No file selected.");
        bytes = await wordToPdf(files[0], onProgress);
      } else {
        if (!files[0]) throw new Error("No file selected.");
        bytes = await excelToPdf(files[0], onProgress);
      }
      setResult({ bytes, name: `${baseName}.pdf` });
    } catch (err) {
      console.error(err);
      setError(
        (err as Error).message ||
          "Conversion failed. Please try a different file."
      );
    } finally {
      setConverting(false);
    }
  };

  // Output actions

  const downloadResult = () => {
    if (!result) return;
    downloadFile(result.bytes, result.name);
  };

  const printResult = () => {
    if (!result) return;
    const err = printFile(result.bytes, result.name);
    if (err) setError(err);
  };

  const shareResult = async () => {
    if (!result) return;
    const err = await shareFile(
      result.bytes,
      result.name,
      "Converted with GetPDFTool"
    );
    if (err) setError(err);
  };

  // ---- UI ----

  return (
    <div className="container-narrow py-6">
      {/* Input area */}
      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-soft">
        {source === "html" ? (
          <>
            <div className="mb-3 inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1 text-xs">
              {(["paste", "file"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setHtmlMode(m);
                    setFiles([]);
                  }}
                  className={`rounded-md px-3 py-1.5 font-medium transition ${
                    htmlMode === m
                      ? "bg-white text-brand-700 shadow"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {m === "paste" ? "Paste HTML" : "Upload .html file"}
                </button>
              ))}
            </div>
            {htmlMode === "paste" ? (
              <textarea
                value={htmlText}
                onChange={(e) => setHtmlText(e.target.value)}
                placeholder='<h1>Hello</h1>\n<p>Paste any HTML here…</p>'
                rows={10}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-xs focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            ) : (
              <FileDropZone
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                files={files}
                onRemove={removeFile}
                onMove={moveFile}
                multiple={false}
                cfg={cfg}
              />
            )}
          </>
        ) : (
          <FileDropZone
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            files={files}
            onRemove={removeFile}
            onMove={moveFile}
            multiple={cfg.multiple}
            cfg={cfg}
          />
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={cfg.accept}
          multiple={cfg.multiple}
          className="hidden"
          onChange={onFileInput}
        />

        {/* Action row */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-500">
            {cfg.description} Converts in your browser — your files never
            leave your device.
          </p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={reset} className="btn-ghost">
              ✕ Clear
            </button>
            <button
              type="button"
              onClick={runConvert}
              disabled={!isInputReady || converting}
              className="btn-primary"
            >
              {converting
                ? progressTotal > 0
                  ? `Converting… ${progress}/${progressTotal}`
                  : "Converting…"
                : `🚀 ${cfg.buttonLabel}`}
            </button>
          </div>
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

      {result && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-center gap-2 text-emerald-800">
            <span className="text-xl">✅</span>
            <h3 className="text-base font-semibold">Conversion complete</h3>
          </div>
          <p className="mt-2 text-sm text-emerald-900/80">
            <strong>{result.name}</strong> ·{" "}
            {formatBytes(result.bytes.byteLength)}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={downloadResult}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-emerald-700"
              title="Download to your computer"
            >
              ↓ Download
            </button>
            <button
              type="button"
              onClick={printResult}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white px-4 py-3 text-sm font-semibold text-emerald-800 transition hover:border-emerald-500"
              title="Open the PDF and print it"
            >
              🖨 Print
            </button>
            <button
              type="button"
              onClick={shareResult}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white px-4 py-3 text-sm font-semibold text-emerald-800 transition hover:border-emerald-500"
              title="Share via WhatsApp / Mail / system share menu"
            >
              📤 Share
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// File drop zone with selected-file list
// =============================================================================

function FileDropZone({
  onDrop,
  onClick,
  files,
  onRemove,
  onMove,
  multiple,
  cfg,
}: {
  onDrop: (e: React.DragEvent) => void;
  onClick: () => void;
  files: File[];
  onRemove: (i: number) => void;
  onMove: (i: number, dir: -1 | 1) => void;
  multiple: boolean;
  cfg: (typeof SOURCE_INFO)[Source];
}) {
  return (
    <>
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={onClick}
        role="button"
        tabIndex={0}
        className="cursor-pointer rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/30 p-6 text-center transition hover:border-brand-400 hover:bg-brand-50/60"
      >
        <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-2xl text-white">
          {cfg.icon}
        </div>
        <p className="text-sm font-medium text-gray-900">
          {multiple
            ? `Drop ${cfg.label} files here, or click to choose`
            : `Drop a ${cfg.label} file here, or click to choose`}
        </p>
        {multiple && (
          <p className="mt-1 text-xs text-gray-500">
            You can pick or drop several at once.
          </p>
        )}
      </div>

      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              <span className="text-base" aria-hidden="true">
                {cfg.icon}
              </span>
              <span className="flex-1 truncate">
                <span className="font-medium text-gray-900">{f.name}</span>
                <span className="ml-2 text-xs text-gray-500">
                  {formatBytes(f.size)}
                </span>
              </span>
              {multiple && files.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => onMove(i, -1)}
                    disabled={i === 0}
                    className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => onMove(i, 1)}
                    disabled={i === files.length - 1}
                    className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                    title="Move down"
                  >
                    ↓
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="rounded p-1 text-red-500 hover:bg-red-50"
                title="Remove"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
