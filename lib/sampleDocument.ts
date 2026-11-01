"use client";

/** A public, fictional two-page example; never reads a visitor's documents. */
export async function createSamplePdf(): Promise<File> {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pages = [
    ["GetPDFTool example document", "Fictional text for trying a conversion.", "Item                Quantity        Amount", "Notebooks           2               12.00", "Pens                3                6.00", "Total                               18.00"],
    ["Second example page", "This page checks that the conversion includes both pages.", "Date: 1 November 2026", "Keep your original documents and inspect downloaded results."]
  ];
  pages.forEach((lines, n) => {
    const page = pdf.addPage([612, 792]);
    lines.forEach((text, i) => page.drawText(text, { x: 48, y: 730 - i * 38, size: i === 0 ? 20 : 12, font: i === 0 ? bold : font, color: rgb(0.1, 0.15, 0.25) }));
    page.drawText(`Example page ${n + 1} of 2`, { x: 48, y: 40, size: 10, font });
  });
  const bytes = await pdf.save();
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return new File([buffer], "getpdftool-example.pdf", { type: "application/pdf" });
}
