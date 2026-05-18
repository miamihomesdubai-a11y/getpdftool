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

const PAGE_URL = "https://www.getpdftool.com/pdf-to-word";

export const metadata: Metadata = {
  title:
    "PDF to Word Online — Convert PDF to Editable DOCX Free | GetPDFTool",
  description:
    "Free online PDF to Word converter. Turn a PDF into an editable .docx file you can open in Microsoft Word, Google Docs or Pages. Browser-based, no signup, no upload.",
  keywords: [
    "PDF to Word",
    "PDF to Word online",
    "PDF to Word free",
    "convert PDF to Word",
    "PDF to DOCX",
    "PDF to editable Word",
    "PDF to Microsoft Word",
    "PDF to Google Docs",
    "free PDF to Word converter",
    "PDF to Word converter online",
    "edit PDF in Word",
    "GetPDFTool",
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "PDF to Word — Free Online PDF to DOCX Converter",
    description:
      "Convert any PDF to an editable Word document. Free, browser-based, your file stays private.",
    url: PAGE_URL,
    siteName: "GetPDFTool",
    type: "website",
  },
};

const FAQS = [
  {
    q: "How do I convert a PDF to Word online for free?",
    a: "Drop your PDF on this page or pick one from your computer, then click Convert to Word. We extract the text and produce a .docx file you can open in Microsoft Word, Google Docs, Apple Pages, LibreOffice, or any other word processor.",
  },
  {
    q: "Will the Word file be editable?",
    a: "Yes. The output is a real .docx file with editable paragraphs. You can change wording, fonts, headings, etc. just like any Word document.",
  },
  {
    q: "Are layout, tables and images preserved?",
    a: "Text content and reading order are preserved as paragraphs. Complex layout — multi-column flow, exact font matching, embedded images, and structured tables — is simplified during conversion. For visual-perfect output, our PDF to JPG or PDF to PowerPoint tools embed each page as an image.",
  },
  {
    q: "Does it work with scanned PDFs?",
    a: "Only for PDFs that already have a text layer. Pure scans are images of text and need OCR (optical character recognition) before they can be converted — a separate workflow.",
  },
  {
    q: "Is the converted file uploaded to your servers?",
    a: "No. Conversion happens entirely inside your web browser. Your PDF and the resulting Word file never leave your device.",
  },
  {
    q: "What apps can open the .docx output?",
    a: "Any modern word processor: Microsoft Word, Google Docs, Apple Pages, LibreOffice Writer, WPS Office. Most email clients also preview .docx attachments inline.",
  },
  {
    q: "Are there file-size limits?",
    a: "There's no fixed limit, but very long PDFs (hundreds of pages) take longer because conversion runs in your browser. Most files finish in seconds.",
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
  name: "PDF to Word — GetPDFTool",
  url: PAGE_URL,
  applicationCategory: "Utility",
  operatingSystem: "Any (web browser)",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "Convert PDF text into an editable .docx file",
    "Page breaks preserved",
    "Opens in Word, Google Docs, Pages, LibreOffice",
    "Browser-based — files never leave your device",
    "Save, Share or Email the result",
  ],
};

const howToData = howToJsonLd({
  name: "How to convert PDF to Word online for free",
  description:
    "Turn any PDF into an editable .docx file with GetPDFTool's free online PDF to Word converter.",
  url: PAGE_URL,
  totalTimeISO: "PT1M",
  steps: [
    {
      name: "Open your PDF",
      text: "Drop a PDF on the page or pick one from your computer.",
    },
    {
      name: "Convert to Word",
      text: "Click Convert to Word — we extract the text and produce a .docx file.",
    },
    {
      name: "Download & edit",
      text: "Download the .docx and open it in Microsoft Word, Google Docs, Pages or LibreOffice.",
    },
  ],
});

const breadcrumbData = breadcrumbJsonLd([
  { name: "Home", url: "https://www.getpdftool.com" },
  { name: "PDF to Word", url: PAGE_URL },
]);

export default function PdfToWordPage() {
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
            PDF to Word
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Convert PDF to Word —{" "}
            <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
              editable DOCX, free
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
            Turn any PDF into a real Word document you can edit in Microsoft
            Word, Google Docs, Pages or LibreOffice. Free, no signup, no
            upload — your file stays in your browser.
          </p>
        </div>
      </section>

      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      <ConvertFromPdfTool target="docx" />

      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      <section className="container-narrow py-12">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          PDF to Word — frequently asked questions
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
        excludeHref="/pdf-to-word"
        heading="More PDF conversions"
      />
      <RelatedTools heading="Edit your PDF in other ways" />
    </>
  );
}
