"use client";

import * as pdfjsLib from "pdfjs-dist";

// Set up the pdf.js worker once, on the client.
// Hosted on unpkg — no extra setup needed in the project.
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export { pdfjsLib };
