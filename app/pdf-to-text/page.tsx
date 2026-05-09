import dynamic from "next/dynamic";
import type { Metadata } from "next";
import AdSlot from "@/components/AdSlot";
import RelatedTools from "@/components/RelatedTools";
import ConvertFromTools from "@/components/ConvertFromTools";

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

const PAGE_URL = "https://www.getpdftool.com/pdf-to-text";

export const metadata: Metadata = {
  title:
    "PDF to Text Online — Extract Text from PDF Free | GetPDFTool",
  description:
    "Free online PDF to text converter. Extract every word from a PDF as a clean .txt file in seconds. Browser-based, no signup, no upload.",
  keywords: [
    "PDF to text",
    "PDF to text online",
    "PDF to text free",
    "extract text from PDF",
    "PDF text extractor",
    "convert PDF to text",
    "PDF to txt",
    "free PDF text converter",
    "PDF text extraction",
    "GetPDFTool",
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "PDF to Text — Free Online Text Extractor",
    description:
      "Extract text from any PDF as a clean .txt file. Free, browser-based, your file stays private.",
    url: PAGE_URL,
    siteName: "GetPDFTool",
    type: "website",
  },
};

const FAQS = [
  {
    q: "How do I convert a PDF to text online for free?",
    a: "Drop your PDF on this page or pick one from your computer. Click Convert to text. We extract every word from every page and give you a clean .txt file you can download.",
  },
  {
    q: "Will the extracted text keep its order?",
    a: "Yes. We group text items by their position on each page so lines flow top-to-bottom and left-to-right. Pages are separated with a divider so it's easy to tell them apart.",
  },
  {
    q: "Does it work with scanned PDFs?",
    a: "Only for PDFs that already contain a text layer. A 'scanned' PDF is essentially an image, with no underlying text. To extract text from a scan you'd need OCR (optical character recognition), which is a separate workflow.",
  },
  {
    q: "Is the converted file uploaded to your servers?",
    a: "No. Conversion happens entirely in your web browser. Your PDF and the resulting .txt file never leave your device.",
  },
  {
    q: "Can I copy-paste the result into Word or Google Docs?",
    a: "Yes. The output is plain text — paste it into anything that accepts text. For a richer Word document with paragraph structure preserved, use our PDF to Word converter instead.",
  },
  {
    q: "Are there file-size limits?",
    a: "There's no fixed limit, but very large PDFs (hundreds of pages) take longer because everything happens in your browser. Most files convert in seconds.",
  },
  {
    q: "Will it preserve tables, lists or formatting?",
    a: "Plain text can't carry visual formatting. We preserve text order; bullets and numbers come through if they're in the source as text, but tables become rows of text rather than structured cells. For tables, use our PDF to Excel converter.",
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
  name: "PDF to Text — GetPDFTool",
  url: PAGE_URL,
  applicationCategory: "Utility",
  operatingSystem: "Any (web browser)",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "Extract every word from a PDF as plain text",
    "Preserves reading order",
    "Page separators in the output",
    "Browser-based — files never leave your device",
    "Save, Share or Email the result",
  ],
};

export default function PdfToTextPage() {
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
            PDF to Text
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Convert PDF to text —{" "}
            <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
              free, instant, private
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
            Extract every word from a PDF as a clean .txt file. Search, copy,
            paste into Word, feed into AI, or pipe into your own scripts. No
            signup. No upload. Runs in your browser.
          </p>
        </div>
      </section>

      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      <ConvertFromPdfTool target="text" />

      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      <section className="container-narrow py-12">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          PDF to text — frequently asked questions
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
        excludeHref="/pdf-to-text"
        heading="More PDF conversions"
      />
      <RelatedTools heading="Edit your PDF in other ways" />
    </>
  );
}
