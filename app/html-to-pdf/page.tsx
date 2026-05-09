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

const PAGE_URL = "https://www.getpdftool.com/html-to-pdf";

export const metadata: Metadata = {
  title: "HTML to PDF Online — Convert Web Page to PDF Free | GetPDFTool",
  description:
    "Free online HTML to PDF converter. Paste HTML or upload a .html file and get a clean multi-page PDF. Browser-based, no signup, no upload.",
  keywords: [
    "HTML to PDF",
    "convert HTML to PDF",
    "HTML to PDF online",
    "HTML to PDF free",
    "web page to PDF",
    "save HTML as PDF",
    "HTML file to PDF",
    "html2pdf",
    "render HTML to PDF",
    "free HTML to PDF converter",
    "GetPDFTool",
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "HTML to PDF — Free Online HTML to PDF Converter",
    description:
      "Paste HTML or upload an .html file and get a clean PDF. Free, browser-based, your code stays private.",
    url: PAGE_URL,
    siteName: "GetPDFTool",
    type: "website",
  },
};

const FAQS = [
  {
    q: "How do I convert HTML to PDF online for free?",
    a: "Paste your HTML code into the text area, or switch to 'Upload .html file' and pick one. Click Convert to PDF — we render the markup in your browser using your fonts and styles, then save it as a multi-page PDF.",
  },
  {
    q: "Will my CSS styles be applied?",
    a: "Yes. The HTML is rendered in a real browser layout context, so inline styles, <style> blocks and class-based rules all apply. External stylesheets work if they are reachable over HTTPS and allow cross-origin requests.",
  },
  {
    q: "Will images and fonts come through?",
    a: "Images and Google Fonts work as long as they're hosted on URLs that allow CORS. Local images (file paths on your computer) won't render — switch them to base-64 data URLs or upload them to a public host.",
  },
  {
    q: "What page size does the PDF use?",
    a: "US Letter (8.5 × 11 in) by default, with a long HTML page automatically split across multiple PDF pages.",
  },
  {
    q: "Will JavaScript run?",
    a: "JavaScript runs while the page is being prepared, but our renderer takes a snapshot soon after, so heavy async work (fetching data, animations) may not finish in time. For best results, render dynamic content into static HTML first.",
  },
  {
    q: "Is my HTML uploaded to your server?",
    a: "No. Conversion runs entirely inside your web browser. Your HTML and the resulting PDF never leave your device.",
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
  name: "HTML to PDF — GetPDFTool",
  url: PAGE_URL,
  applicationCategory: "Utility",
  operatingSystem: "Any (web browser)",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function HtmlToPdfPage() {
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
            HTML to PDF
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Convert HTML to PDF —{" "}
            <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
              clean multi-page output
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
            Paste any HTML or upload an .html file and we'll render it as a
            multi-page PDF using your real browser fonts and styles. Free, no
            signup, your code stays private.
          </p>
        </div>
      </section>

      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      <ConvertToPdfTool source="html" />

      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      <section className="container-narrow py-12">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          HTML to PDF — frequently asked questions
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
        excludeHref="/html-to-pdf"
        heading="More 'Convert to PDF' tools"
      />
      <ConvertFromTools heading="Or go the other way: Convert FROM PDF" />
      <RelatedTools heading="Edit your PDF in other ways" />
    </>
  );
}
