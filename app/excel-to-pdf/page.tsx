import dynamic from "next/dynamic";
import type { Metadata } from "next";
import AdSlot from "@/components/AdSlot";
import RelatedTools from "@/components/RelatedTools";
import ConvertFromTools from "@/components/ConvertFromTools";
import ConvertToTools from "@/components/ConvertToTools";

const ConvertToPdfTool = dynamic(
  () => import("@/components/ConvertToPdfTool"),
  {
    ssr: false,
    loading: () => (
      <div className="container-narrow py-16 text-center text-sm text-gray-500">
        Loading converter…
      </div>
    ),
  }
);

const PAGE_URL = "https://www.getpdftool.com/excel-to-pdf";

export const metadata: Metadata = {
  title: "Excel to PDF Online — Convert XLSX to PDF Free | GetPDFTool",
  description:
    "Free online Excel to PDF converter. Turn .xlsx workbooks into clean PDF tables in your browser. No signup, no upload — your data stays private.",
  keywords: [
    "Excel to PDF",
    "XLSX to PDF",
    "convert Excel to PDF",
    "Excel to PDF online",
    "Excel to PDF free",
    "spreadsheet to PDF",
    "save Excel as PDF",
    "Excel sheet to PDF",
    "free XLSX to PDF",
    "GetPDFTool",
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Excel to PDF — Free Online XLSX to PDF Converter",
    description:
      "Drop an .xlsx file and get a clean PDF. Free, browser-based, your data stays private.",
    url: PAGE_URL,
    siteName: "GetPDFTool",
    type: "website",
  },
};

const FAQS = [
  {
    q: "How do I convert Excel to PDF for free?",
    a: "Drop your .xlsx file on this page (or pick one from your computer) and click Convert to PDF. Each sheet in the workbook is rendered as a clean table in the resulting PDF.",
  },
  {
    q: "Which Excel formats are supported?",
    a: "The modern .xlsx format (Excel 2007 and newer) and most .xls files. Google Sheets users should download as .xlsx first.",
  },
  {
    q: "Will multiple sheets all be included?",
    a: "Yes. Every sheet in the workbook is included, with the sheet name as a heading above its table. Long sheets automatically flow across multiple PDF pages.",
  },
  {
    q: "Will my formulas, charts and conditional formatting come through?",
    a: "The PDF shows the values you can see — formulas are evaluated to their results. Charts, conditional formatting colours, and complex cell formatting are simplified or not preserved. For a pixel-perfect copy, use Excel's File → Save as PDF.",
  },
  {
    q: "Will column widths and merged cells be respected?",
    a: "Yes — column widths set in the workbook are honored, and merged cells render as merged in the PDF.",
  },
  {
    q: "Is my workbook uploaded to your server?",
    a: "No. Conversion runs entirely inside your web browser. Your Excel file and the resulting PDF never leave your device.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Excel to PDF — GetPDFTool",
  url: PAGE_URL,
  applicationCategory: "Utility",
  operatingSystem: "Any (web browser)",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function ExcelToPdfPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />

      <section className="container-narrow pb-2 pt-10 sm:pt-14">
        <div className="text-center">
          <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700">
            Excel to PDF
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Convert Excel to PDF —{" "}
            <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
              free, every sheet
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
            Turn any .xlsx workbook into a clean PDF. Every sheet is included
            on its own page. Free, no signup, your data stays in your browser.
          </p>
        </div>
      </section>

      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      <ConvertToPdfTool source="excel" />

      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      <section className="container-narrow py-12">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Excel to PDF — frequently asked questions
        </h2>
        <div className="mt-6 space-y-4">
          {FAQS.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-soft"
            >
              <summary className="cursor-pointer list-none text-base font-semibold text-gray-900">
                <span className="mr-2 inline-block text-brand-600 transition group-open:rotate-90">
                  ▶
                </span>
                {faq.q}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      <ConvertToTools
        excludeHref="/excel-to-pdf"
        heading="More 'Convert to PDF' tools"
      />
      <ConvertFromTools heading="Or go the other way: Convert FROM PDF" />
      <RelatedTools heading="Edit your PDF in other ways" />
    </>
  );
}
