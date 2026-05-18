import dynamic from "next/dynamic";
import AdSlot from "@/components/AdSlot";
import RelatedTools from "@/components/RelatedTools";
import ConvertFromTools from "@/components/ConvertFromTools";
import ConvertToTools from "@/components/ConvertToTools";
import {
  breadcrumbJsonLd,
  howToJsonLd,
  ldScriptProps,
} from "@/lib/seo";

const SITE = "https://www.getpdftool.com";

// PDF editor uses browser-only APIs (canvas, pdf.js worker) — disable SSR.
const PDFEditor = dynamic(() => import("@/components/PDFEditor"), {
  ssr: false,
  loading: () => (
    <div className="container-narrow py-16 text-center text-sm text-gray-500">
      Loading editor…
    </div>
  ),
});

const FEATURES = [
  {
    icon: "✏️",
    title: "Add text & notes",
    body: "Click anywhere on a PDF to add text in the size and color you want.",
  },
  {
    icon: "🖍️",
    title: "Highlight & draw",
    body: "Highlight key passages or draw freely with the pen tool.",
  },
  {
    icon: "🔁",
    title: "Rotate & delete pages",
    body: "Rearrange your document — fix sideways scans or remove unwanted pages.",
  },
  {
    icon: "🔒",
    title: "100% private",
    body: "All editing happens inside your browser. Your files never leave your device.",
  },
  {
    icon: "⚡",
    title: "Fast & free",
    body: "No signup. No watermarks. No upload waiting time. Edit instantly.",
  },
  {
    icon: "📱",
    title: "Works everywhere",
    body: "Use it on Windows, Mac, Linux, Chromebook, iPad — any modern browser.",
  },
];

const FAQS = [
  {
    q: "Is GetPDFTool really free?",
    a: "Yes. The PDF editor is 100% free to use, with no sign-up, no trial period, and no watermarks added to your files. We pay for the site by showing relevant advertising.",
  },
  {
    q: "Are my files uploaded to your servers?",
    a: "No. Editing happens entirely inside your web browser using JavaScript. The PDF you open never leaves your device, which keeps your documents private.",
  },
  {
    q: "What kinds of PDFs can I edit?",
    a: "Most standard PDFs — including text documents, scanned pages, forms, and reports. Password-protected PDFs need to be unlocked first using your password.",
  },
  {
    q: "Will my edits look the same when I download the file?",
    a: "Yes. When you click Download, we generate a brand-new PDF that includes your text, drawings, highlights, page rotations, and deletions exactly as you arranged them.",
  },
  {
    q: "Which browsers are supported?",
    a: "Any modern browser works: Chrome, Firefox, Safari, Edge, Brave, Opera, and others. For best performance we recommend keeping your browser up to date.",
  },
  {
    q: "Do you have other PDF tools?",
    a: "Yes — and more are on the way. We are continuously adding tools such as merge, split, compress, convert, sign and many others. Check back soon.",
  },
];

/** Schema.org JSON-LD payloads for the homepage. Powers rich
 *  snippets: FAQ accordions, HowTo step-by-step, and breadcrumb path
 *  in Google's SERP. */
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const howToData = howToJsonLd({
  name: "How to edit a PDF online for free",
  description:
    "Edit any PDF in your browser with GetPDFTool — add text, draw, highlight, rotate or delete pages, then download the edited PDF.",
  url: SITE,
  totalTimeISO: "PT1M",
  steps: [
    {
      name: "Open your PDF",
      text: "Drag and drop a PDF onto the editor, or pick a file from your computer.",
    },
    {
      name: "Edit with the toolbar",
      text: "Use the toolbar to add text, draw, highlight, rotate, or delete pages.",
    },
    {
      name: "Save and download",
      text: "Click Save Changes to preview, then Download to save the edited PDF to your device.",
    },
  ],
});

const breadcrumbData = breadcrumbJsonLd([
  { name: "Home", url: SITE },
]);

export default function HomePage() {
  return (
    <>
      {/* Page-level structured data */}
      <script {...ldScriptProps(faqJsonLd)} />
      <script {...ldScriptProps(howToData)} />
      <script {...ldScriptProps(breadcrumbData)} />

      {/* Hero */}
      <section className="bg-deco container-narrow relative pb-4 pt-12 sm:pt-16">
        <div className="relative z-10 text-center">
          <span className="badge-pill">
            <span aria-hidden="true">★</span> All Free PDF Editor Plus More
          </span>
          <h1 className="mt-5 text-5xl font-extrabold tracking-tighter text-ink-900 sm:text-6xl lg:text-7xl">
            <span className="block">Free online PDF editor —</span>
            <span className="block text-brand-600">edit any PDF in your browser</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-600 sm:text-lg">
            Add text, draw, highlight, rotate or delete pages, sign, merge,
            compress and convert PDFs — then download.
            <br className="hidden sm:block" />
            No sign-up. No watermarks. No upload — files stay on your device.
          </p>
        </div>
      </section>

      {/* Top ad slot */}
      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      {/* Editor */}
      <PDFEditor />

      {/* Mid-page ad slot */}
      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      {/*
        --------------------------------------------------------------------
        TOOL DISCOVERY — moved up. Visitors land in the editor; immediately
        below they see the full catalogue of "Organise / Convert from /
        Convert to" tools so they can jump to whichever conversion they
        actually came for.
        --------------------------------------------------------------------
      */}
      <RelatedTools heading="Organise PDF — all-in-one tools" />
      <ConvertFromTools />
      <ConvertToTools />

      {/* Mid-page ad slot #2 — between tools and the marketing content */}
      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      {/*
        --------------------------------------------------------------------
        ABOUT / WHY — moved down. Visitors who scroll this far are evaluating
        rather than ready-to-edit, so the marketing copy comes after the
        tool list.
        --------------------------------------------------------------------
      */}
      <section className="container-narrow py-12">
        <h2 className="text-center text-2xl font-bold text-ink-900 sm:text-3xl">
          Everything you need to work with PDFs
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-ink-600">
          GetPDFTool is built for everyone — students, teachers, freelancers,
          and small businesses. Free forever, with more tools coming soon.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-ink-100 bg-white p-6 text-center shadow-soft transition hover:-translate-y-0.5 hover:shadow-pop sm:text-left"
            >
              <div className="text-3xl">{f.icon}</div>
              <h3 className="mt-3 text-lg font-semibold text-ink-900">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How-it-works */}
      <section className="container-narrow py-8">
        <div className="rounded-3xl bg-gradient-to-br from-brand-50 to-accent-100/30 p-8 sm:p-12">
          <h2 className="text-center text-2xl font-bold text-ink-900 sm:text-3xl sm:text-left">
            How it works
          </h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-3">
            <li className="text-center sm:text-left">
              <div className="mx-auto grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white sm:mx-0">
                1
              </div>
              <h3 className="mt-3 font-semibold text-ink-900">
                Open your PDF
              </h3>
              <p className="mt-1 text-sm text-ink-600">
                Drag and drop, or pick a file from your computer.
              </p>
            </li>
            <li className="text-center sm:text-left">
              <div className="mx-auto grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white sm:mx-0">
                2
              </div>
              <h3 className="mt-3 font-semibold text-ink-900">
                Edit with the toolbar
              </h3>
              <p className="mt-1 text-sm text-ink-600">
                Add text, draw, highlight, or rotate pages.
              </p>
            </li>
            <li className="text-center sm:text-left">
              <div className="mx-auto grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white sm:mx-0">
                3
              </div>
              <h3 className="mt-3 font-semibold text-ink-900">Download</h3>
              <p className="mt-1 text-sm text-ink-600">
                Save your edited PDF in one click — straight to your device.
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* Bottom ad slot */}
      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      {/* FAQ */}
      <section className="container-narrow py-12">
        <h2 className="text-center text-2xl font-bold text-ink-900 sm:text-left sm:text-3xl">
          Frequently asked questions
        </h2>
        <div className="mt-6 space-y-4">
          {FAQS.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-2xl border border-ink-100 bg-white p-5 shadow-soft"
            >
              <summary className="cursor-pointer list-none text-base font-semibold text-ink-900">
                <span className="mr-2 inline-block text-brand-600 transition group-open:rotate-90">
                  ▶
                </span>
                {faq.q}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-600">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
