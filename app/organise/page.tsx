import dynamic from "next/dynamic";
import type { Metadata } from "next";
import AdSlot from "@/components/AdSlot";

const OrganiseTool = dynamic(() => import("@/components/OrganiseTool"), {
  ssr: false,
  loading: () => (
    <div className="container-narrow py-16 text-center text-sm text-gray-500">
      Loading organiser…
    </div>
  ),
});

const PAGE_URL = "https://www.getpdftool.com/organise";

export const metadata: Metadata = {
  title:
    "Organise PDF Online — Reorder, Merge, Rotate, Delete & Duplicate Pages",
  description:
    "Free online PDF organiser. Reorder pages with drag-and-drop, merge another PDF, rotate, duplicate or delete one or many pages, add blank pages, and download — all in your browser. No signup, no upload.",
  keywords: [
    "organise PDF",
    "organize PDF",
    "rearrange PDF pages",
    "reorder PDF pages",
    "merge PDF online",
    "combine PDF",
    "delete PDF pages",
    "remove pages from PDF",
    "rotate PDF pages",
    "duplicate PDF page",
    "copy PDF page",
    "add blank page to PDF",
    "insert page into PDF",
    "PDF page manager",
    "PDF organizer free",
    "free online PDF organizer",
    "edit PDF pages online",
    "PDF page editor",
    "split PDF",
    "GetPDFTool",
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Organise PDF — Reorder, Merge, Rotate, Delete or Duplicate Pages",
    description:
      "Drag-and-drop PDF page organiser. Reorder, merge another PDF, rotate, copy or delete pages — all free, in your browser.",
    url: PAGE_URL,
    siteName: "GetPDFTool",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Organise PDF — Free Online PDF Page Organiser",
    description:
      "Reorder, merge, rotate, copy or delete PDF pages with drag-and-drop. Free and private.",
  },
};

const FEATURES = [
  {
    icon: "🖱️",
    title: "Drag and drop to reorder",
    body: "Pick up any page thumbnail and drop it into the order you want. Page numbers renumber automatically.",
  },
  {
    icon: "➕",
    title: "Add blank pages or merge another PDF",
    body: "Insert a fresh blank page at the end, or append every page from another PDF — basically a built-in merge tool.",
  },
  {
    icon: "⎘",
    title: "Duplicate any page",
    body: "Select one or many pages and click Copy. Each copy lands right after its original so you can rearrange from there.",
  },
  {
    icon: "🗑️",
    title: "Delete one or many pages",
    body: "Click to select, ⌘/Ctrl-click to add more, or Shift-click to pick a range — then remove them all in one click.",
  },
  {
    icon: "🔄",
    title: "Rotate clockwise or counter-clockwise",
    body: "Fix sideways scans or flip a page 180° with the per-page rotate buttons.",
  },
  {
    icon: "🔍",
    title: "Full-size preview",
    body: "Tap the ＋ on any thumbnail to enlarge the page. Press Enter or Esc to go back. Make sure the right page is in the right place.",
  },
  {
    icon: "↶",
    title: "Undo every change",
    body: "Step back through your last 50 edits — reorders, deletes, copies, rotations, anything.",
  },
  {
    icon: "🔒",
    title: "100% private — browser-based",
    body: "Your PDF is processed entirely inside your web browser. Nothing is uploaded to our servers, and we never see your file.",
  },
  {
    icon: "📤",
    title: "Save, Share or Email",
    body: "When you're done, save your changes and download, share via the system share menu, or open your email app pre-filled.",
  },
];

const STEPS = [
  {
    n: 1,
    title: "Open your PDF",
    body: "Drop a PDF file on the page or pick one from your computer.",
  },
  {
    n: 2,
    title: "Select & rearrange",
    body: "Click pages to select them, drag thumbnails to reorder, copy or delete in batch from the toolbar.",
  },
  {
    n: 3,
    title: "Edit each page",
    body: "Rotate clockwise/counter-clockwise. Click ＋ to enlarge a page and confirm it's the right one.",
  },
  {
    n: 4,
    title: "Save & deliver",
    body: "Click Save Changes, then Download, Share or Email the organised PDF.",
  },
];

const FAQS = [
  {
    q: "How do I reorder PDF pages online for free?",
    a: "Drop your PDF on this page, then drag any page thumbnail and drop it where you want it. Page numbers update automatically. When you're happy with the order, click Save Changes and Download.",
  },
  {
    q: "Can I merge two PDFs into one?",
    a: "Yes. Open the first PDF, then click the + Add Page button in the toolbar and choose 'Pages from PDF…' to append every page of a second file at the end. Save and download to get one merged PDF.",
  },
  {
    q: "How do I delete multiple PDF pages at once?",
    a: "Click the first page you want to remove, then ⌘/Ctrl-click to add more, or Shift-click to pick a continuous range. Then click 🗑 Delete in the toolbar — every selected page is removed in one step.",
  },
  {
    q: "Can I duplicate a PDF page?",
    a: "Yes. Select one or several pages and click the ⎘ Copy button. Each duplicate appears immediately after its original. You can then drag the copies anywhere or rotate them independently.",
  },
  {
    q: "How do I add a blank page to a PDF?",
    a: "Click + Add Page in the toolbar and choose 'Blank page'. A fresh A4 page is appended at the end. Drag it to wherever you need it before saving.",
  },
  {
    q: "How do I rotate a PDF page?",
    a: "Hover over any page thumbnail and use the ↺ (counter-clockwise) or ↻ (clockwise) button. Each click rotates the page 90°. Rotation is preserved in the saved PDF.",
  },
  {
    q: "Will my files be uploaded anywhere?",
    a: "No. The PDF you choose is processed entirely in your web browser using JavaScript. Nothing is sent to our servers, which keeps your documents private and the tool fast.",
  },
  {
    q: "Is there a page-count limit?",
    a: "There's no fixed limit, but very large PDFs (200+ pages) may take longer to render thumbnails because everything happens in your browser. For most documents the tool is instant.",
  },
  {
    q: "Will the original PDF quality be preserved?",
    a: "Yes. The tool rebuilds the PDF using the original page content and only changes the order, rotation, or which pages are included. There is no recompression of images or text.",
  },
  {
    q: "Does this work on mobile?",
    a: "Yes — drag-and-drop works on iPhone, iPad and Android browsers. On a phone, long-press a page thumbnail to start dragging.",
  },
];

const USE_CASES = [
  {
    title: "Students & teachers",
    body: "Combine handouts, swap chapter order, drop unwanted pages from a scanned textbook, or duplicate worksheet pages for a class.",
  },
  {
    title: "Freelancers & contractors",
    body: "Reorder a proposal, append a signed addendum, remove the cover sheet, or merge supporting documents into one tidy file.",
  },
  {
    title: "Small business owners",
    body: "Build invoices and contracts from reusable pages, insert your terms at the end, or rotate a sideways scanned receipt before sending.",
  },
  {
    title: "Anyone who scans paperwork",
    body: "Quickly fix sideways pages, delete blank scans, and put pages back in order — without installing any software.",
  },
];

// JSON-LD structured data for FAQ rich snippets in Google search results.
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
  name: "Organise PDF — GetPDFTool",
  url: PAGE_URL,
  applicationCategory: "Utility",
  operatingSystem: "Any (web browser)",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "Reorder PDF pages by drag-and-drop",
    "Merge another PDF (append all its pages)",
    "Add blank pages",
    "Duplicate pages",
    "Delete one or many pages at once",
    "Rotate clockwise and counter-clockwise",
    "Full-size page preview",
    "Undo (50 steps)",
    "Browser-based — files never leave your device",
    "Save, Share or Email the result",
  ],
};

export default function OrganisePage() {
  return (
    <>
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />

      {/* Hero */}
      <section className="container-narrow pb-2 pt-10 sm:pt-14">
        <div className="text-center">
          <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700">
            Organise PDF
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Reorder, merge, rotate or delete{" "}
            <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
              PDF pages — free
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
            The fastest way to organise a PDF online. Drag-and-drop to reorder,
            append another PDF, add blank pages, copy or delete pages in
            batch, rotate, preview at full size, then save. All in your browser
            — no signup, no upload.
          </p>
        </div>
      </section>

      {/* Top ad slot */}
      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      {/* The tool */}
      <OrganiseTool />

      {/* Mid-page ad slot */}
      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      {/* Features — one card per real action in the toolbar */}
      <section className="container-narrow py-12">
        <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
          Everything you can do with this PDF organiser
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
          A complete, free PDF page manager — built for students, teachers,
          freelancers and small businesses. No installs, no accounts.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="text-3xl">{f.icon}</div>
              <h3 className="mt-3 text-lg font-semibold text-gray-900">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container-narrow py-8">
        <div className="rounded-3xl bg-gradient-to-br from-brand-50 to-accent-500/5 p-8 sm:p-12">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            How to organise a PDF in 4 steps
          </h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <li key={s.n}>
                <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">
                  {s.n}
                </div>
                <h3 className="mt-3 font-semibold text-gray-900">{s.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Use cases */}
      <section className="container-narrow py-12">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Who uses GetPDFTool to organise PDFs?
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {USE_CASES.map((u) => (
            <div
              key={u.title}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-soft"
            >
              <h3 className="text-base font-semibold text-gray-900">
                {u.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {u.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom ad slot */}
      <div className="container-narrow">
        <AdSlot label="Sponsored" />
      </div>

      {/* FAQ */}
      <section className="container-narrow py-12">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Frequently asked questions about organising PDFs
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
    </>
  );
}
