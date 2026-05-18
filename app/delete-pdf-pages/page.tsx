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

const PAGE_URL = "https://www.getpdftool.com/delete-pdf-pages";

export const metadata: Metadata = {
  title: "Delete Pages from PDF Online — Free PDF Page Remover | GetPDFTool",
  description:
    "Remove unwanted pages from a PDF online for free. Select one or many pages and delete them in one click. Browser-based, no signup, no upload.",
  keywords: [
    "delete pages from PDF",
    "delete PDF pages",
    "remove pages from PDF",
    "remove PDF pages",
    "delete pages from PDF online",
    "delete pages from PDF free",
    "PDF page remover",
    "remove blank pages from PDF",
    "delete page in PDF",
    "free PDF page deleter",
    "GetPDFTool",
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Delete PDF Pages — Free Online PDF Page Remover",
    description:
      "Remove one or many pages from a PDF in one click. Free, browser-based, your file stays private.",
    url: PAGE_URL,
    siteName: "GetPDFTool",
    type: "website",
  },
};

const FAQS = [
  {
    q: "How do I delete a page from a PDF online for free?",
    a: "Drop your PDF on this page, click the page you want to remove (it shows a blue ring with a ✓), then click 🗑 Delete in the toolbar. Click Save Changes and Download to keep the result.",
  },
  {
    q: "Can I delete multiple PDF pages at once?",
    a: "Yes. Click the first page to select it, then ⌘/Ctrl-click to add more, or Shift-click to pick a continuous range. Click 🗑 Delete in the toolbar — every selected page is removed in one step.",
  },
  {
    q: "How do I undo a deletion?",
    a: "Click ↶ Undo (or press Cmd/Ctrl-Z) right after deleting. The pages reappear in their original positions. Up to 50 changes can be reverted.",
  },
  {
    q: "Are my files uploaded to a server?",
    a: "No. Page removal happens entirely inside your web browser. Your PDF never leaves your device.",
  },
  {
    q: "Can I delete a range of pages?",
    a: "Yes. Shift-click selects a continuous range. For example, click page 5, Shift-click page 12, and pages 5 through 12 are all selected. Click 🗑 Delete to remove them.",
  },
  {
    q: "Does deleting pages affect the others?",
    a: "Only their numbering. Remaining pages are renumbered consecutively (page 8 becomes page 7 if page 1 is removed) and the saved PDF reflects the new order.",
  },
  {
    q: "Will removing pages reduce file size?",
    a: "Usually yes — the saved PDF only includes the kept pages, so file size scales accordingly. There's no recompression of the remaining content.",
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
  name: "Delete PDF Pages — GetPDFTool",
  url: PAGE_URL,
  applicationCategory: "Utility",
  operatingSystem: "Any (web browser)",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "Delete one page or many at once",
    "Range select with Shift-click",
    "Multi-select with Cmd/Ctrl-click",
    "Undo (50 steps)",
    "Browser-based — files never leave your device",
    "Save, Share or Email the result",
  ],
};

const howToData = howToJsonLd({
  name: "How to delete pages from a PDF online for free",
  description:
    "Remove unwanted pages from a PDF with GetPDFTool's free online PDF page remover.",
  url: PAGE_URL,
  totalTimeISO: "PT1M",
  steps: [
    {
      name: "Open your PDF",
      text: "Drop a PDF on the page or pick one from your computer.",
    },
    {
      name: "Select & delete",
      text: "Click pages to select. ⌘/Ctrl-click adds more. Shift-click picks a range. Then click 🗑 Delete.",
    },
    {
      name: "Save and download",
      text: "Click Save Changes, then Download the trimmed PDF.",
    },
  ],
});

const breadcrumbData = breadcrumbJsonLd([
  { name: "Home", url: "https://www.getpdftool.com" },
  { name: "Delete PDF Pages", url: PAGE_URL },
]);

export default function DeletePdfPagesPage() {
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
            Delete PDF Pages
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Delete pages from a PDF —{" "}
            <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
              one or many at a time
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
            Remove unwanted pages from any PDF in seconds. Pick one, a range,
            or scattered pages — then delete the lot with a single click.
            Free. No signup. No upload. Runs in your browser.
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
          How to delete PDF pages in 3 steps
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
              t: "Select & delete",
              b: "Click pages to select. ⌘/Ctrl-click adds more. Shift-click picks a range. Then click 🗑 Delete.",
            },
            {
              n: 3,
              t: "Save and download",
              b: "Click Save Changes, then Download the trimmed PDF.",
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
            Common reasons to remove pages from a PDF
          </h2>
          <p className="mt-3 max-w-3xl text-gray-700">
            Trim blank pages from a scanned document. Drop a confidential
            cover sheet before forwarding. Cut a long report down to the
            chapters you need. Remove duplicate pages from a merged file.
            With GetPDFTool you can pick and remove any pages — one at a
            time or in batches — without uploading your file anywhere.
          </p>
        </div>
      </section>

      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      <section className="container-narrow py-12">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Delete PDF pages — frequently asked questions
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

      <RelatedTools excludeHref="/delete-pdf-pages" />
    </>
  );
}
