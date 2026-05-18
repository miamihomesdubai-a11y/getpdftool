import dynamic from "next/dynamic";
import type { Metadata } from "next";
import AdSlot from "@/components/AdSlot";
import RelatedTools from "@/components/RelatedTools";
import ConvertFromTools from "@/components/ConvertFromTools";
import ConvertToTools from "@/components/ConvertToTools";
import {
  breadcrumbJsonLd,
  howToJsonLd,
  ldScriptProps,
} from "@/lib/seo";

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

const PAGE_URL = "https://www.getpdftool.com/word-to-pdf";

export const metadata: Metadata = {
  title: "Word to PDF Online — Convert DOCX to PDF Free | GetPDFTool",
  description:
    "Free online Word to PDF converter. Turn .docx files into clean PDFs in your browser. No signup, no upload — your document stays private.",
  keywords: [
    "Word to PDF",
    "DOCX to PDF",
    "convert Word to PDF",
    "Word to PDF online",
    "Word to PDF free",
    "doc to PDF",
    "save Word as PDF",
    "Word document to PDF",
    "free DOCX to PDF",
    "GetPDFTool",
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Word to PDF — Free Online DOCX to PDF Converter",
    description:
      "Drop a .docx file and get a clean PDF. Free, browser-based, your file stays private.",
    url: PAGE_URL,
    siteName: "GetPDFTool",
    type: "website",
  },
};

const FAQS = [
  {
    q: "How do I convert a Word document to PDF for free?",
    a: "Drop your .docx file on this page or pick one from your computer, then click Convert to PDF. We translate the document into clean HTML using your local fonts and render it to a multi-page PDF.",
  },
  {
    q: "Which Word formats are supported?",
    a: "The modern .docx format (Word 2007 and newer). The older .doc binary format isn't supported — open it in Word or Google Docs first and re-save as .docx.",
  },
  {
    q: "Will my formatting be preserved?",
    a: "Headings, paragraphs, lists, simple tables, bold/italic, links and inline images come through well. Very complex layouts — multi-column pages, headers/footers, page numbers, footnotes, comments, change tracking — are simplified or omitted.",
  },
  {
    q: "Will images come through?",
    a: "Yes — images embedded inside the .docx are extracted and shown inline in the same place in the PDF.",
  },
  {
    q: "Is my file uploaded to your server?",
    a: "No. Conversion runs entirely inside your web browser. Your Word file and the resulting PDF never leave your device.",
  },
  {
    q: "Will the PDF look exactly like Word's print preview?",
    a: "Visually similar but not pixel-perfect. Word's own print-to-PDF (File → Save as PDF) is the closest if you need an exact reproduction. Use this tool when you don't have Word installed or want a quick browser-based conversion.",
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
  name: "Word to PDF — GetPDFTool",
  url: PAGE_URL,
  applicationCategory: "Utility",
  operatingSystem: "Any (web browser)",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

const howToData = howToJsonLd({
  name: "How to convert Word to PDF online for free",
  description:
    "Turn a .docx file into a clean PDF with GetPDFTool's free online Word to PDF converter.",
  url: PAGE_URL,
  totalTimeISO: "PT1M",
  steps: [
    {
      name: "Open your Word file",
      text: "Drop a .docx on the page or pick one from your computer.",
    },
    {
      name: "Convert to PDF",
      text: "Click Convert to PDF — we render the document using your local fonts and produce a multi-page PDF.",
    },
    {
      name: "Download the PDF",
      text: "Download the finished PDF — or share or email it from the tool.",
    },
  ],
});

const breadcrumbData = breadcrumbJsonLd([
  { name: "Home", url: "https://www.getpdftool.com" },
  { name: "Word to PDF", url: PAGE_URL },
]);

export default function WordToPdfPage() {
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
            Word to PDF
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Convert Word to PDF —{" "}
            <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
              free, browser-based
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
            Turn any .docx file into a clean PDF. No signup, no upload — your
            document is processed inside your browser.
          </p>
        </div>
      </section>

      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      <ConvertToPdfTool source="word" />

      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      <section className="container-narrow py-12">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Word to PDF — frequently asked questions
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
        excludeHref="/word-to-pdf"
        heading="More 'Convert to PDF' tools"
      />
      <ConvertFromTools heading="Or go the other way: Convert FROM PDF" />
      <RelatedTools heading="Edit your PDF in other ways" />
    </>
  );
}
