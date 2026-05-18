import dynamic from "next/dynamic";
import type { Metadata } from "next";
import AdSlot from "@/components/AdSlot";
import RelatedTools from "@/components/RelatedTools";
import {
  breadcrumbJsonLd,
  howToJsonLd,
  ldScriptProps,
} from "@/lib/seo";

const OrganiseTool = dynamic(() => import("@/components/OrganiseTool"), {
  ssr: false,
  loading: () => (
    <div className="container-narrow py-16 text-center text-sm text-gray-500">
      Loading…
    </div>
  ),
});

const PAGE_URL = "https://www.getpdftool.com/add-pdf-pages";

export const metadata: Metadata = {
  title: "Add Pages to PDF Online — Insert Blank or PDF Pages | GetPDFTool",
  description:
    "Add pages to a PDF online for free. Insert a blank page or append all pages from another PDF, then drag to position. No signup, no upload — runs in your browser.",
  keywords: [
    "add pages to PDF",
    "add page to PDF",
    "insert page in PDF",
    "insert PDF page",
    "add blank page to PDF",
    "append PDF pages",
    "add pages to PDF free",
    "add pages to PDF online",
    "extend PDF",
    "PDF page inserter",
    "GetPDFTool",
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Add Pages to PDF — Free Online PDF Page Inserter",
    description:
      "Insert blank pages or pages from another PDF, then drag to reorder. Free, browser-based.",
    url: PAGE_URL,
    siteName: "GetPDFTool",
    type: "website",
  },
};

const FAQS = [
  {
    q: "How do I add a page to a PDF online?",
    a: "Open your PDF on this page. Click + Add Page in the toolbar and choose 'Blank page' to insert an empty A4 page, or 'Pages from PDF…' to append every page from another PDF. New pages land at the end — drag them to wherever you want.",
  },
  {
    q: "Can I insert a blank page anywhere in the PDF?",
    a: "Yes. After adding a blank page (it appears at the end), drag its thumbnail to the position you want. Page numbers automatically renumber.",
  },
  {
    q: "Can I add pages from another PDF?",
    a: "Yes. Click + Add Page → 'Pages from PDF…', pick the second file, and every one of its pages is appended in order. Drag any of them to mix the two documents however you like.",
  },
  {
    q: "What size are the blank pages?",
    a: "Blank pages are inserted as A4 portrait (595 × 842 PDF points). They keep the same dimensions in the saved PDF.",
  },
  {
    q: "Are my files uploaded to a server?",
    a: "No. Adding pages happens entirely inside your web browser. Nothing is sent to our servers, which keeps your documents private.",
  },
  {
    q: "Can I undo if I add the wrong page?",
    a: "Yes. Click ↶ Undo (or press Cmd/Ctrl-Z) to remove the just-added page. You can step back through up to 50 changes.",
  },
  {
    q: "Will adding pages affect quality?",
    a: "No. Original pages are preserved exactly. Newly inserted pages from another PDF keep their original content and resolution. We don't recompress.",
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
  name: "Add Pages to PDF — GetPDFTool",
  url: PAGE_URL,
  applicationCategory: "Utility",
  operatingSystem: "Any (web browser)",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "Insert blank A4 pages",
    "Append all pages from another PDF",
    "Drag inserted pages anywhere",
    "Browser-based — files never leave your device",
    "Save, Share or Email the result",
  ],
};

const howToData = howToJsonLd({
  name: "How to add pages to a PDF online for free",
  description:
    "Insert blank pages or append pages from another PDF with GetPDFTool's free online PDF page inserter.",
  url: PAGE_URL,
  totalTimeISO: "PT1M",
  steps: [
    {
      name: "Open your PDF",
      text: "Drop a PDF or pick one from your computer.",
    },
    {
      name: "Insert pages",
      text: "Click + Add Page → 'Blank page' or 'Pages from PDF…'. Drag the new pages to the right spot.",
    },
    {
      name: "Save and download",
      text: "Click Save Changes, then Download the extended PDF.",
    },
  ],
});

const breadcrumbData = breadcrumbJsonLd([
  { name: "Home", url: "https://www.getpdftool.com" },
  { name: "Add PDF Pages", url: PAGE_URL },
]);

export default function AddPdfPagesPage() {
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
            Add PDF Pages
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Add pages to a PDF —{" "}
            <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
              blank or from another file
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
            Insert blank pages or append every page from another PDF, then
            drag to position. Free, browser-based, no signup. Your file stays
            on your device.
          </p>
        </div>
      </section>

      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      <OrganiseTool />

      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      <section className="container-narrow py-12">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          How to add pages to a PDF in 3 steps
        </h2>
        <ol className="mt-6 grid gap-6 sm:grid-cols-3">
          {[
            {
              n: 1,
              t: "Open your PDF",
              b: "Drop a PDF or pick one from your computer.",
            },
            {
              n: 2,
              t: "Insert pages",
              b: "Click + Add Page → 'Blank page' or 'Pages from PDF…'. Drag the new pages to the right spot.",
            },
            {
              n: 3,
              t: "Save and download",
              b: "Click Save Changes, then Download the extended PDF.",
            },
          ].map((s) => (
            <li
              key={s.n}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-soft"
            >
              <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">
                {s.n}
              </div>
              <h3 className="mt-3 font-semibold text-gray-900">{s.t}</h3>
              <p className="mt-1 text-sm text-gray-600">{s.b}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="container-narrow py-8">
        <div className="rounded-3xl bg-gradient-to-br from-brand-50 to-accent-500/5 p-8 sm:p-12">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Why add pages to a PDF online?
          </h2>
          <p className="mt-3 max-w-3xl text-gray-700">
            Tack on a signed addendum without re-scanning the whole document.
            Insert a blank page so you can write notes on it later. Combine
            two short PDFs without installing software. Whatever the reason,
            GetPDFTool lets you add pages in your browser, preserves the
            original quality, and never asks for an account.
          </p>
        </div>
      </section>

      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      <section className="container-narrow py-12">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Add pages to PDF — frequently asked questions
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

      <RelatedTools excludeHref="/add-pdf-pages" />
    </>
  );
}
