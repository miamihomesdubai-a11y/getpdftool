import dynamic from "next/dynamic";
import type { Metadata } from "next";
import AdSlot from "@/components/AdSlot";
import RelatedTools from "@/components/RelatedTools";
import ConvertFromTools from "@/components/ConvertFromTools";
import {
  breadcrumbJsonLd,
  howToJsonLd,
  ldScriptProps,
} from "@/lib/seo";

const ConvertFromPdfTool = dynamic(
  () => import("@/components/ConvertFromPdfTool"),
  {
    ssr: false,
    loading: () => (
      <div className="container-narrow py-16 text-center text-sm text-gray-500">
        Loading converter…
      </div>
    ),
  }
);

const PAGE_URL = "https://www.getpdftool.com/pdf-to-excel";

export const metadata: Metadata = {
  title:
    "PDF to Excel Online — Convert PDF Tables to XLSX Free | GetPDFTool",
  description:
    "Free online PDF to Excel converter. Turn a PDF into an editable .xlsx spreadsheet with one sheet per page. Browser-based, no signup, no upload — your file stays private.",
  keywords: [
    "PDF to Excel",
    "PDF to Excel online",
    "PDF to Excel free",
    "convert PDF to Excel",
    "PDF to XLSX",
    "PDF table to Excel",
    "PDF to spreadsheet",
    "extract tables from PDF",
    "PDF to Excel converter",
    "free PDF to Excel",
    "PDF data to Excel",
    "PDF to Google Sheets",
    "GetPDFTool",
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "PDF to Excel — Free Online PDF to XLSX Converter",
    description:
      "Convert any PDF into an editable Excel spreadsheet. Free, browser-based, your file stays private.",
    url: PAGE_URL,
    siteName: "GetPDFTool",
    type: "website",
  },
};

const FAQS = [
  {
    q: "How do I convert a PDF to Excel online for free?",
    a: "Drop a PDF here or pick one from your computer, then click Convert to Excel. We give you an .xlsx file with one sheet per page. Words on the same line become cells in the same row, ordered by their position on the page.",
  },
  {
    q: "Will the tables come through correctly?",
    a: "PDFs with clear, well-spaced tabular layouts come through best — each line becomes a row, each word becomes a cell. Visually loose tables (variable spacing, merged cells, multi-line entries) may need a quick clean-up in Excel after import.",
  },
  {
    q: "Does it work with scanned PDFs?",
    a: "Only for PDFs that already contain a text layer. Pure image scans need OCR (optical character recognition) first, which is a separate workflow.",
  },
  {
    q: "Is the converted file uploaded to your servers?",
    a: "No. Conversion runs entirely inside your web browser. Your PDF and the resulting Excel file never leave your device.",
  },
  {
    q: "What apps can open the .xlsx output?",
    a: "Microsoft Excel, Google Sheets, Apple Numbers, LibreOffice Calc, WPS Office — anything that opens spreadsheets. The format is standard Excel.",
  },
  {
    q: "Will formulas, charts and pivot tables come through?",
    a: "No — those don't exist in the source PDF. The output contains the values you can see, ready for you to add formulas, charts or pivots in Excel.",
  },
  {
    q: "Are there limits on file size or page count?",
    a: "There's no fixed limit, but very large PDFs (hundreds of pages) take longer because conversion happens in your browser. Most files finish in seconds.",
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
  name: "PDF to Excel — GetPDFTool",
  url: PAGE_URL,
  applicationCategory: "Utility",
  operatingSystem: "Any (web browser)",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "Convert each PDF page into its own Excel sheet",
    "Lines become rows, words become cells",
    "Opens in Excel, Google Sheets, Numbers, LibreOffice",
    "Browser-based — files never leave your device",
    "Save, Share or Email the result",
  ],
};

const howToData = howToJsonLd({
  name: "How to convert PDF to Excel online for free",
  description:
    "Turn any PDF into an editable .xlsx spreadsheet with GetPDFTool's free online PDF to Excel converter.",
  url: PAGE_URL,
  totalTimeISO: "PT1M",
  steps: [
    {
      name: "Open your PDF",
      text: "Drop a PDF on the page or pick one from your computer.",
    },
    {
      name: "Convert to Excel",
      text: "Click Convert to Excel — each page becomes its own sheet, with lines as rows and words as cells.",
    },
    {
      name: "Download & edit",
      text: "Download the .xlsx and open it in Excel, Google Sheets, Numbers or LibreOffice Calc.",
    },
  ],
});

const breadcrumbData = breadcrumbJsonLd([
  { name: "Home", url: "https://www.getpdftool.com" },
  { name: "PDF to Excel", url: PAGE_URL },
]);

export default function PdfToExcelPage() {
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
      <script {...ldScriptProps(howToData)} />
      <script {...ldScriptProps(breadcrumbData)} />

      <section className="container-narrow pb-2 pt-10 sm:pt-14">
        <div className="text-center">
          <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700">
            PDF to Excel
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Convert PDF to Excel —{" "}
            <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
              editable XLSX, free
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
            Turn a PDF into a real Excel workbook — one sheet per page, with
            words placed into cells based on their position on the page.
            Free, no signup, no upload — your file stays in your browser.
          </p>
        </div>
      </section>

      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      <ConvertFromPdfTool target="xlsx" />

      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      <section className="container-narrow py-12">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          PDF to Excel — frequently asked questions
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

      <ConvertFromTools
        excludeHref="/pdf-to-excel"
        heading="More PDF conversions"
      />
      <RelatedTools heading="Edit your PDF in other ways" />
    </>
  );
}
