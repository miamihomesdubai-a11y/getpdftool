import dynamic from "next/dynamic";
import type { Metadata } from "next";
import AdSlot from "@/components/AdSlot";
import RelatedTools from "@/components/RelatedTools";

const OrganiseTool = dynamic(() => import("@/components/OrganiseTool"), {
  ssr: false,
  loading: () => (
    <div className="container-narrow py-16 text-center text-sm text-gray-500">
      Loading…
    </div>
  ),
});

const PAGE_URL = "https://www.getpdftool.com/copy-pdf-pages";

export const metadata: Metadata = {
  title: "Copy PDF Pages Online — Free Page Duplicator | GetPDFTool",
  description:
    "Duplicate any PDF page online — single page or batch. Each copy lands right after its original so you can rearrange. Free, browser-based, no signup, no upload.",
  keywords: [
    "copy PDF page",
    "copy PDF pages",
    "duplicate PDF page",
    "duplicate PDF pages",
    "duplicate page in PDF",
    "PDF page duplicator",
    "copy pages in PDF",
    "duplicate PDF online",
    "free PDF page copier",
    "extract PDF pages",
    "GetPDFTool",
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Copy / Duplicate PDF Pages — Free Online Tool",
    description:
      "Make copies of any PDF page in seconds. Free, browser-based, your file stays private.",
    url: PAGE_URL,
    siteName: "GetPDFTool",
    type: "website",
  },
};

const FAQS = [
  {
    q: "How do I duplicate a page in a PDF online?",
    a: "Drop your PDF here, click the page you want to copy, then click ⎘ Copy in the toolbar. A duplicate appears immediately after the original. Click Save Changes and Download to keep it.",
  },
  {
    q: "Can I duplicate several pages at once?",
    a: "Yes. ⌘/Ctrl-click to multi-select pages, or Shift-click for a continuous range, then click ⎘ Copy. Each selected page gets its own duplicate placed right after the original.",
  },
  {
    q: "Where do the copies end up?",
    a: "Each duplicate is inserted right after its source page. After copying, the new copies become the active selection so you can drag them anywhere or rotate them independently.",
  },
  {
    q: "Can I make multiple copies of the same page?",
    a: "Yes. Click ⎘ Copy more than once on the same selection — every press adds another duplicate right after the previous one.",
  },
  {
    q: "Are my files uploaded to a server?",
    a: "No. Page duplication happens entirely inside your web browser. Your PDF never leaves your device.",
  },
  {
    q: "Will the duplicate be identical to the original?",
    a: "Yes. The copy uses the exact same content as the source page, including any embedded fonts and images. You can rotate or reposition copies without affecting the originals.",
  },
  {
    q: "Can I undo a copy?",
    a: "Yes. Click ↶ Undo (or press Cmd/Ctrl-Z) to remove the last duplicates. Up to 50 changes can be reverted.",
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
  name: "Copy PDF Pages — GetPDFTool",
  url: PAGE_URL,
  applicationCategory: "Utility",
  operatingSystem: "Any (web browser)",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "Duplicate one page or many at once",
    "Multi-select with Cmd/Ctrl-click",
    "Range select with Shift-click",
    "Each copy lands right after its original",
    "Browser-based — files never leave your device",
    "Save, Share or Email the result",
  ],
};

export default function CopyPdfPagesPage() {
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
            Copy PDF Pages
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Duplicate any PDF page —{" "}
            <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
              free, in your browser
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
            Make instant copies of any page in a PDF — one at a time or many
            at once. Each duplicate lands right after its original, ready to
            be rotated, repositioned or kept as a reusable template. No
            signup. No upload.
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
          How to copy PDF pages in 3 steps
        </h2>
        <ol className="mt-6 grid gap-6 sm:grid-cols-3">
          {[
            {
              n: 1,
              t: "Open your PDF",
              b: "Drop a PDF on the page or pick one from your computer.",
            },
            {
              n: 2,
              t: "Select & copy",
              b: "Click pages to select. ⌘/Ctrl-click for many, Shift-click for a range. Then click ⎘ Copy.",
            },
            {
              n: 3,
              t: "Save and download",
              b: "Click Save Changes, then Download the file with the new duplicates.",
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
            Why duplicate PDF pages?
          </h2>
          <p className="mt-3 max-w-3xl text-gray-700">
            Print extra copies of a worksheet or invoice template. Build a
            multi-page version of a single design. Keep an original alongside
            an annotated copy so you have both. GetPDFTool's duplicator runs
            in your browser, copies the exact source content, and never
            touches your file on a remote server.
          </p>
        </div>
      </section>

      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      <section className="container-narrow py-12">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Copy PDF pages — frequently asked questions
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

      <RelatedTools excludeHref="/copy-pdf-pages" />
    </>
  );
}
