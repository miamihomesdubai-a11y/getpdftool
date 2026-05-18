/**
 * Shared download / print / share helpers used by every save flow
 * in the app (PDFEditor, OrganiseTool, CompressTool, SignPdfTool,
 * ConvertFromPdfTool, ConvertToPdfTool, WatermarkTool).
 *
 * Keeping the logic here means each tool exposes the same three
 * actions (Download · Print · Share) with identical behaviour and
 * any future bugfix only needs to be made once.
 *
 * Notes on each action:
 *   - downloadFile: trivial — anchor with `download` attribute.
 *   - printFile:    opens the PDF in a new tab and auto-fires print()
 *                   once it loads. This is the only reliable cross-
 *                   browser way to print a Blob-backed PDF; embedded
 *                   iframes silently fail in Chrome's PDF viewer
 *                   process. The new tab gives the user the native PDF
 *                   viewer's Print button as a manual fallback.
 *   - shareFile:    Web Share API. Works for files on iOS / Android —
 *                   that's how the user reaches WhatsApp, Mail,
 *                   AirDrop, Telegram etc. from this app. Desktop
 *                   browsers without Share fall back to a friendly
 *                   download-instead message.
 *
 * Email was intentionally removed. The mailto: protocol cannot carry
 * an attachment, so the previous behaviour was "download the file,
 * then open the mail app for the user to manually attach it" — which
 * is the same as just downloading. The Share button covers email on
 * mobile and Download covers it everywhere else.
 */

/** Build a File object from raw bytes for share-sheet APIs. */
export function bytesToFile(
  bytes: Uint8Array,
  fileName: string,
  mime: string = "application/pdf"
): File {
  const blob = new Blob([new Uint8Array(bytes)], { type: mime });
  return new File([blob], fileName, { type: mime });
}

/** Trigger a browser download for the given bytes. */
export function downloadFile(bytes: Uint8Array, fileName: string): void {
  const file = bytesToFile(bytes, fileName);
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Print bytes by opening them in a new tab and auto-firing print().
 * Returns an error message on failure (popup blocker, mostly).
 *
 * Must be called inside a click handler — the synchronous `window.open`
 * is required or the popup blocker fires.
 */
export function printFile(
  bytes: Uint8Array,
  fileName: string
): string | null {
  const file = bytesToFile(bytes, fileName);
  const url = URL.createObjectURL(file);
  const w = window.open(url, "_blank");
  if (!w) {
    URL.revokeObjectURL(url);
    return "Your browser blocked the print popup. Please allow popups for getpdftool.com.";
  }
  w.addEventListener(
    "load",
    () => {
      try {
        w.focus();
        w.print();
      } catch (err) {
        console.warn(
          "Auto-print failed; user can use the PDF viewer's Print button.",
          err
        );
      }
    },
    { once: true }
  );
  // Release the original blob reference after a generous delay.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return null;
}

/**
 * Share bytes via the system share sheet (Web Share API).
 *
 * On iOS / Android the share sheet lets the user pick WhatsApp, Mail,
 * Messages, AirDrop, Telegram, etc. — a PDF file is a real attachment
 * in any of these. On desktop browsers without Web Share, returns a
 * friendly error so callers can display a "download instead" hint.
 */
export async function shareFile(
  bytes: Uint8Array,
  fileName: string,
  text: string = "Edited with GetPDFTool"
): Promise<string | null> {
  const file = bytesToFile(bytes, fileName);
  const nav = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean;
  };
  if (
    typeof nav.share === "function" &&
    typeof nav.canShare === "function" &&
    nav.canShare({ files: [file] })
  ) {
    try {
      await nav.share({ title: file.name, text, files: [file] });
      return null;
    } catch (err) {
      if ((err as Error).name === "AbortError") return null;
      return "Could not open the share menu.";
    }
  }
  return "Sharing isn't supported in this browser. Please use Download instead — most desktop browsers don't have a system share sheet.";
}
